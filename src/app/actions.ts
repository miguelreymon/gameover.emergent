
'use server';

import { z } from 'zod';
import { Resend } from 'resend';
import Stripe from 'stripe';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-09-30.clover' })
  : null;

// Schema definitions using Zod directly
const CustomerSchema = z.object({
  email: z.string(),
  phone: z.string().optional(),
  firstName: z.string(),
  address: z.string(),
  apartment: z.string().optional(),
  city: z.string(),
  postalCode: z.string(),
  country: z.string(),
});

const CartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  price: z.number(),
  quantity: z.number(),
  color: z.string().optional(),
  isUpsell: z.boolean().optional(),
});

const ProcessOrderInputSchema = z.object({
  paymentMethod: z.enum(['card', 'cod', 'bizum']),
  currency: z.string().default('EUR'),
  totalAmount: z.number(),
  customer: CustomerSchema,
  cartItems: z.array(CartItemSchema),
});

export type ProcessOrderInput = z.infer<typeof ProcessOrderInputSchema>;

const ProcessOrderOutputSchema = z.object({
  success: z.boolean(),
  orderId: z.string().nullable(),
  // For card flow we return a URL to redirect the user to Stripe Checkout
  redirectUrl: z.string().nullable().optional(),
  error: z.string().nullable(),
});

export type ProcessOrderOutput = z.infer<typeof ProcessOrderOutputSchema>;

const SubmitReviewInputSchema = z.object({
  name: z.string(),
  orderId: z.string(),
  rating: z.number().min(1).max(5),
  text: z.string(),
  photoDataUri: z.string().optional(),
});

export type SubmitReviewInput = z.infer<typeof SubmitReviewInputSchema>;

const SubmitReviewOutputSchema = z.object({
  success: z.boolean(),
  isVerified: z.boolean(),
});

export type SubmitReviewOutput = z.infer<typeof SubmitReviewOutputSchema>;

// Type describing the order data passed between client and server actions
type OrderPayload = {
  customer: z.infer<typeof CustomerSchema>;
  cartItems: z.infer<typeof CartItemSchema>[];
  total: number;
};

type PaymentMethodInput = 'card' | 'cod' | 'bizum';

export async function processOrderAction({
  payment,
  order,
  origin,
}: {
  payment: { paymentMethod: PaymentMethodInput; currency?: string };
  order: OrderPayload;
  origin?: string;
}): Promise<ProcessOrderOutput> {
  try {
    const displayOrderId = Math.floor(1000 + Math.random() * 9000).toString();
    const isFreeOrder = order.total <= 0;

    // === PAYMENT WITH CARD via Stripe Checkout ===
    if (payment.paymentMethod === 'card' && !isFreeOrder) {
      if (!stripe) {
        return {
          success: false,
          orderId: null,
          error: 'Pagos con tarjeta no configurados. Contacta con el administrador.',
        };
      }

      const baseUrl =
        origin ||
        process.env.NEXT_PUBLIC_BASE_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

      // Build line items from the cart (price-by-price, never trust frontend totals
      // beyond the sum of these items). Upsells with price=0 are sent as 0-cost items.
      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = order.cartItems.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: (payment.currency || 'EUR').toLowerCase(),
          unit_amount: Math.max(0, Math.round(item.price * 100)),
          product_data: {
            name: item.color ? `${item.name} (${item.color})` : item.name,
          },
        },
      }));

      // If a coupon/discount lowered the total below the sum of items, apply it
      // as a Stripe coupon (one-time amount_off).
      const itemsTotalCents = order.cartItems.reduce(
        (sum, i) => sum + Math.round(i.price * 100) * i.quantity,
        0
      );
      const targetTotalCents = Math.max(0, Math.round(order.total * 100));
      let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
      if (targetTotalCents < itemsTotalCents) {
        const amountOff = itemsTotalCents - targetTotalCents;
        const coupon = await stripe.coupons.create({
          amount_off: amountOff,
          currency: (payment.currency || 'EUR').toLowerCase(),
          duration: 'once',
          name: 'Descuento aplicado',
        });
        discounts = [{ coupon: coupon.id }];
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items,
        discounts,
        customer_email: order.customer.email,
        success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/checkout/cancel`,
        metadata: {
          orderId: displayOrderId,
          customerName: order.customer.firstName,
          customerEmail: order.customer.email,
          customerPhone: order.customer.phone || '',
          shippingAddress: order.customer.address,
          shippingCity: order.customer.city,
          shippingPostalCode: order.customer.postalCode,
          shippingCountry: order.customer.country,
          totalAmount: order.total.toFixed(2),
          itemsSummary: order.cartItems
            .map((i) => `${i.quantity}x ${i.name}${i.color ? ` (${i.color})` : ''}`)
            .join(' | ')
            .slice(0, 490),
        },
      });

      if (!session.url) {
        return {
          success: false,
          orderId: null,
          error: 'No se pudo iniciar la pasarela de pago.',
        };
      }

      return {
        success: true,
        orderId: displayOrderId,
        redirectUrl: session.url,
        error: null,
      };
    }

    // === BIZUM, COD or FREE ORDER (no card processing) ===
    console.log('--- PROCESANDO PEDIDO (sin tarjeta) ---');
    console.log('ID Pedido:', displayOrderId, 'Método:', payment.paymentMethod);

    await Promise.all([
      sendOrderNotification({ ...order, orderId: displayOrderId, paymentMethod: payment.paymentMethod }),
      sendCustomerEmail({ ...order, orderId: displayOrderId, paymentMethod: payment.paymentMethod }),
    ]);

    return {
      success: true,
      orderId: displayOrderId,
      error: null,
    };
  } catch (error) {
    console.error('Error processing order action:', error);
    return {
      success: false,
      orderId: null,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

// Verifies a Stripe checkout session after the user comes back from Stripe.
// Sends notification emails the first time the session is verified as paid.
export async function verifyStripeSession(sessionId: string): Promise<{
  success: boolean;
  paid: boolean;
  orderId: string | null;
  total: number;
  customerEmail: string;
  error: string | null;
}> {
  try {
    if (!stripe) {
      return { success: false, paid: false, orderId: null, total: 0, customerEmail: '', error: 'Stripe no configurado.' };
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer_details'],
    });

    const paid = session.payment_status === 'paid';
    const orderId = (session.metadata?.orderId as string) || null;
    const customerEmail =
      (session.metadata?.customerEmail as string) ||
      session.customer_details?.email ||
      '';
    const total = session.amount_total ? session.amount_total / 100 : 0;

    if (paid && session.metadata?.notified !== 'true' && orderId) {
      // Reconstruct an order payload from metadata + line items for emails.
      const lineItems = (session.line_items?.data || []).map((li) => ({
        id: li.id,
        name: li.description || 'Producto',
        image: '',
        price: (li.price?.unit_amount || 0) / 100,
        quantity: li.quantity || 1,
      }));

      const orderPayload: OrderPayload & { orderId: string; paymentMethod: string } = {
        customer: {
          email: customerEmail,
          firstName: (session.metadata?.customerName as string) || '',
          phone: (session.metadata?.customerPhone as string) || undefined,
          address: (session.metadata?.shippingAddress as string) || '',
          city: (session.metadata?.shippingCity as string) || '',
          postalCode: (session.metadata?.shippingPostalCode as string) || '',
          country: (session.metadata?.shippingCountry as string) || '',
        },
        cartItems: lineItems,
        total,
        orderId,
        paymentMethod: 'card',
      };

      // Fire-and-forget emails, but await so the page can show "email sent" state.
      await Promise.all([sendOrderNotification(orderPayload), sendCustomerEmail(orderPayload)]);

      // Mark session as notified so refreshing the success page doesn't re-send.
      try {
        await stripe.checkout.sessions.update(sessionId, {
          metadata: { ...(session.metadata || {}), notified: 'true' },
        });
      } catch (e) {
        console.warn('Could not update Stripe session metadata:', e);
      }
    }

    return { success: true, paid, orderId, total, customerEmail, error: null };
  } catch (error) {
    console.error('Error verifying Stripe session:', error);
    return {
      success: false,
      paid: false,
      orderId: null,
      total: 0,
      customerEmail: '',
      error: error instanceof Error ? error.message : 'No se pudo verificar el pago.',
    };
  }
}

async function sendCustomerEmail(input: OrderPayload & { orderId: string; paymentMethod?: string }): Promise<void> {
  if (!resend) {
    console.log('--- SIMULANDO ENVÍO DE EMAIL (RESEND_API_KEY NO CONFIGURADA) ---');
    console.log('Destinatario:', input.customer.email);
    return;
  }

  try {
    const itemsHtml = input.cartItems
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} ${item.color ? `(${item.color})` : ''}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toFixed(0)}€</td>
      </tr>
    `
      )
      .join('');

    const bizumInstructions =
      input.paymentMethod === 'bizum'
        ? `
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <h3 style="color: #1e40af; margin-top: 0;">Instrucciones de Pago Bizum</h3>
        <p>Has seleccionado el pago vía Bizum. Para que podamos procesar tu pedido, por favor realiza el pago de <strong>${input.total.toFixed(0)}€</strong> al siguiente número:</p>
        <div style="text-align: center; font-size: 24px; font-weight: bold; padding: 10px; background: white; border-radius: 5px; margin: 10px 0; border: 1px dashed #3b82f6;">
          680414307
        </div>
        <p style="font-size: 14px; margin-bottom: 0;"><strong>Concepto:</strong> #${input.orderId}</p>
        <p style="font-size: 12px; color: #6b7280; margin-top: 5px;">* Es muy importante incluir el número de pedido en el concepto.</p>
      </div>
    `
        : '';

    const paymentMethodText =
      input.paymentMethod === 'bizum' ? 'Bizum' : input.paymentMethod === 'cod' ? 'Contrareembolso' : 'Tarjeta';

    const { data, error } = await resend.emails.send({
      from: 'Gameover <onboarding@resend.dev>',
      to: [input.customer.email],
      subject: `Confirmación de tu pedido #${input.orderId} - Gameover`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h1 style="color: #2563eb; text-align: center;">¡Gracias por tu pedido!</h1>
          <p>Hola ${input.customer.firstName},</p>
          <p>Hemos recibido tu pedido correctamente. Aquí tienes los detalles:</p>

          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Número de Pedido:</strong> #${input.orderId}</p>
            <p style="margin: 5px 0 0 0;"><strong>Método de Pago:</strong> ${paymentMethodText}</p>
            <p style="margin: 5px 0 0 0;"><strong>Total:</strong> ${input.total.toFixed(0)}€</p>
          </div>

          ${bizumInstructions}

          <h3>Resumen del Pedido</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; text-align: left;">Producto</th>
                <th style="padding: 10px; text-align: center;">Cant.</th>
                <th style="padding: 10px; text-align: right;">Precio</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top: 20px;">
            <p><strong>Dirección de Envío:</strong></p>
            <p style="color: #4b5563; margin: 0;">
              ${input.customer.address}<br>
              ${input.customer.city}, ${input.customer.postalCode}<br>
              ${input.customer.country}
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

          <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            Si tienes alguna duda, responde a este email o contáctanos por WhatsApp.<br>
            © 2026 Gameover. Todos los derechos reservados.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending email via Resend:', error);
    } else {
      console.log('Email sent successfully:', data?.id);
    }
  } catch (e) {
    console.error('Exception sending email:', e);
  }
}

async function sendOrderNotification(input: OrderPayload & { orderId: string; paymentMethod?: string }): Promise<void> {
  if (!resend) {
    console.log('--- SIMULANDO NOTIFICACIÓN DE PEDIDO (RESEND_API_KEY NO CONFIGURADA) ---');
    return;
  }

  try {
    const paymentMethodName =
      input.paymentMethod === 'bizum' ? 'Bizum' : input.paymentMethod === 'cod' ? 'Contrareembolso' : 'Tarjeta';

    const itemsHtml = input.cartItems
      .map(
        (item) => `
      <li>${item.name} (x${item.quantity}) - ${item.price.toFixed(0)}€</li>
    `
      )
      .join('');

    const { data, error } = await resend.emails.send({
      from: 'Gameover Orders <onboarding@resend.dev>',
      to: ['miguelreynau@gmail.com'],
      subject: `NUEVO PEDIDO RECIBIDO #${input.orderId}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb;">Nuevo Pedido Recibido</h2>
          <p><strong>Número de Pedido:</strong> #${input.orderId}</p>
          <p><strong>Método de Pago:</strong> ${paymentMethodName}</p>
          <p><strong>Total:</strong> ${input.total.toFixed(0)}€</p>

          <hr>

          <h3>Detalles del Cliente</h3>
          <p><strong>Nombre:</strong> ${input.customer.firstName}</p>
          <p><strong>Email:</strong> ${input.customer.email}</p>
          <p><strong>Teléfono:</strong> ${input.customer.phone || 'No proporcionado'}</p>

          <h3>Dirección de Envío</h3>
          <p>
            ${input.customer.address}<br>
            ${input.customer.city}, ${input.customer.postalCode}<br>
            ${input.customer.country}
          </p>

          <hr>

          <h3>Artículos</h3>
          <ul>
            ${itemsHtml}
          </ul>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending order notification email:', error);
    } else {
      console.log('Order notification email sent successfully:', data?.id);
    }
  } catch (e) {
    console.error('Error in sendOrderNotification:', e);
  }
}

export async function submitReviewAction(input: SubmitReviewInput): Promise<SubmitReviewOutput> {
  try {
    const isVerified = input.orderId.length > 0;

    console.log('Review submitted:', {
      ...input,
      isVerified,
      createdAt: new Date().toISOString(),
    });

    return { success: true, isVerified };
  } catch (error) {
    console.error('Error submitting review:', error);
    return { success: false, isVerified: false };
  }
}
