
'use server';

import { z } from 'zod';
import { Resend } from 'resend';
import Stripe from 'stripe';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-09-30.clover' })
  : null;

// Schemas
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

export type Customer = z.infer<typeof CustomerSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;

type OrderPayload = {
  customer: Customer;
  cartItems: CartItem[];
  total: number;
};

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

// =============================================================================
// PAYMENT INTENT (embedded checkout)
// =============================================================================
// Creates a Stripe PaymentIntent so the embedded <PaymentElement> can render
// card / Apple Pay / Google Pay / Bizum based on the customer's device.

export async function createPaymentIntentAction({
  customer,
  cartItems,
  total,
}: {
  customer: Customer;
  cartItems: CartItem[];
  total: number;
}): Promise<{
  success: boolean;
  clientSecret: string | null;
  paymentIntentId: string | null;
  orderId: string | null;
  error: string | null;
}> {
  try {
    if (!stripe) {
      return {
        success: false,
        clientSecret: null,
        paymentIntentId: null,
        orderId: null,
        error: 'Pagos no configurados. Falta STRIPE_SECRET_KEY.',
      };
    }
    if (total <= 0) {
      return {
        success: false,
        clientSecret: null,
        paymentIntentId: null,
        orderId: null,
        error: 'El importe debe ser mayor que 0.',
      };
    }

    const orderId = Math.floor(1000 + Math.random() * 9000).toString();
    const amountCents = Math.round(total * 100);

    const itemsSummary = cartItems
      .map((i) => `${i.quantity}x ${i.name}${i.color ? ` (${i.color})` : ''}`)
      .join(' | ')
      .slice(0, 490);

    const intent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      receipt_email: customer.email,
      description: `Pedido Gameover #${orderId}`,
      statement_descriptor_suffix: 'GAMEOVER',
      shipping: {
        name: customer.firstName,
        phone: customer.phone || undefined,
        address: {
          line1: customer.address,
          line2: customer.apartment || undefined,
          city: customer.city,
          postal_code: customer.postalCode,
          country: 'ES',
        },
      },
      metadata: {
        orderId,
        customerName: customer.firstName,
        customerEmail: customer.email,
        customerPhone: customer.phone || '',
        shippingAddress: customer.address,
        shippingApartment: customer.apartment || '',
        shippingCity: customer.city,
        shippingPostalCode: customer.postalCode,
        shippingCountry: customer.country,
        totalAmount: total.toFixed(2),
        itemsSummary,
        cartItemsJson: JSON.stringify(
          cartItems.map((i) => ({ n: i.name, c: i.color || '', p: i.price, q: i.quantity }))
        ).slice(0, 4500),
      },
    });

    return {
      success: true,
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      orderId,
      error: null,
    };
  } catch (error) {
    console.error('Error creating PaymentIntent:', error);
    return {
      success: false,
      clientSecret: null,
      paymentIntentId: null,
      orderId: null,
      error: error instanceof Error ? error.message : 'No se pudo iniciar el pago.',
    };
  }
}

// Update an existing PaymentIntent's amount (when the cart total changes:
// coupons, quantity changes, etc.). Returns a fresh client_secret if needed.
export async function updatePaymentIntentAmountAction({
  paymentIntentId,
  total,
}: {
  paymentIntentId: string;
  total: number;
}): Promise<{ success: boolean; error: string | null }> {
  try {
    if (!stripe) return { success: false, error: 'Stripe no configurado.' };
    if (total <= 0) return { success: false, error: 'Importe inválido.' };
    await stripe.paymentIntents.update(paymentIntentId, {
      amount: Math.round(total * 100),
    });
    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'No se pudo actualizar el importe.',
    };
  }
}

// Verifies a PaymentIntent after the customer is redirected back to /checkout/success.
// Sends notification emails the first time the intent is verified as succeeded.
export async function verifyStripePaymentAction(paymentIntentId: string): Promise<{
  success: boolean;
  paid: boolean;
  orderId: string | null;
  total: number;
  customerEmail: string;
  paymentMethodType: string;
  error: string | null;
}> {
  try {
    if (!stripe) {
      return {
        success: false,
        paid: false,
        orderId: null,
        total: 0,
        customerEmail: '',
        paymentMethodType: '',
        error: 'Stripe no configurado.',
      };
    }

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['payment_method'],
    });

    const paid = intent.status === 'succeeded';
    const orderId = (intent.metadata?.orderId as string) || null;
    const customerEmail = (intent.metadata?.customerEmail as string) || intent.receipt_email || '';
    const total = intent.amount ? intent.amount / 100 : 0;

    let paymentMethodType = '';
    const pm = intent.payment_method;
    if (pm && typeof pm !== 'string') {
      paymentMethodType = pm.type;
    } else if (intent.payment_method_types?.length) {
      paymentMethodType = intent.payment_method_types[0];
    }

    if (paid && intent.metadata?.notified !== 'true' && orderId) {
      let cartItems: CartItem[] = [];
      try {
        const parsed: Array<{ n: string; c: string; p: number; q: number }> = JSON.parse(
          (intent.metadata?.cartItemsJson as string) || '[]'
        );
        cartItems = parsed.map((it, idx) => ({
          id: `m-${idx}`,
          name: it.n,
          image: '',
          price: it.p,
          quantity: it.q,
          color: it.c || undefined,
        }));
      } catch {
        // If metadata can't be parsed, send email with a single line "Pedido"
        cartItems = [{ id: 'order', name: 'Pedido', image: '', price: total, quantity: 1 }];
      }

      const orderPayload: OrderPayload & { orderId: string; paymentMethod: string } = {
        customer: {
          email: customerEmail,
          firstName: (intent.metadata?.customerName as string) || '',
          phone: (intent.metadata?.customerPhone as string) || undefined,
          address: (intent.metadata?.shippingAddress as string) || '',
          apartment: (intent.metadata?.shippingApartment as string) || undefined,
          city: (intent.metadata?.shippingCity as string) || '',
          postalCode: (intent.metadata?.shippingPostalCode as string) || '',
          country: (intent.metadata?.shippingCountry as string) || '',
        },
        cartItems,
        total,
        orderId,
        paymentMethod: paymentMethodType,
      };

      await Promise.all([sendOrderNotification(orderPayload), sendCustomerEmail(orderPayload)]);

      try {
        await stripe.paymentIntents.update(paymentIntentId, {
          metadata: { ...(intent.metadata || {}), notified: 'true' },
        });
      } catch (e) {
        console.warn('Could not update PaymentIntent metadata:', e);
      }
    }

    return {
      success: true,
      paid,
      orderId,
      total,
      customerEmail,
      paymentMethodType,
      error: null,
    };
  } catch (error) {
    console.error('Error verifying PaymentIntent:', error);
    return {
      success: false,
      paid: false,
      orderId: null,
      total: 0,
      customerEmail: '',
      paymentMethodType: '',
      error: error instanceof Error ? error.message : 'No se pudo verificar el pago.',
    };
  }
}

// =============================================================================
// FREE ORDER (coupon makes total = 0). Just send confirmation emails.
// =============================================================================
export async function processFreeOrderAction({
  customer,
  cartItems,
  total,
}: {
  customer: Customer;
  cartItems: CartItem[];
  total: number;
}): Promise<{ success: boolean; orderId: string | null; error: string | null }> {
  try {
    const orderId = Math.floor(1000 + Math.random() * 9000).toString();
    await Promise.all([
      sendOrderNotification({ customer, cartItems, total, orderId, paymentMethod: 'free' }),
      sendCustomerEmail({ customer, cartItems, total, orderId, paymentMethod: 'free' }),
    ]);
    return { success: true, orderId, error: null };
  } catch (error) {
    return {
      success: false,
      orderId: null,
      error: error instanceof Error ? error.message : 'No se pudo procesar el pedido gratuito.',
    };
  }
}

// =============================================================================
// EMAIL HELPERS (Resend)
// =============================================================================

function paymentMethodLabel(method?: string): string {
  switch (method) {
    case 'card':
      return 'Tarjeta';
    case 'bizum':
      return 'Bizum';
    case 'apple_pay':
      return 'Apple Pay';
    case 'google_pay':
      return 'Google Pay';
    case 'link':
      return 'Stripe Link';
    case 'free':
      return 'Cupón (gratis)';
    case '':
    case undefined:
      return 'Online';
    default:
      return method.charAt(0).toUpperCase() + method.slice(1);
  }
}

async function sendCustomerEmail(input: OrderPayload & { orderId: string; paymentMethod?: string }): Promise<void> {
  if (!resend) {
    console.log('--- SIMULANDO ENVÍO DE EMAIL (RESEND_API_KEY NO CONFIGURADA) ---');
    console.log('Destinatario:', input.customer.email);
    return;
  }
  if (!input.customer.email) {
    console.warn('No customer email available, skipping send.');
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
            <p style="margin: 5px 0 0 0;"><strong>Método de Pago:</strong> ${paymentMethodLabel(input.paymentMethod)}</p>
            <p style="margin: 5px 0 0 0;"><strong>Total:</strong> ${input.total.toFixed(0)}€</p>
          </div>

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
    const itemsHtml = input.cartItems
      .map(
        (item) => `
      <li>${item.name} (x${item.quantity}) - ${item.price.toFixed(0)}€</li>
    `
      )
      .join('');

    const { data, error } = await resend.emails.send({
      from: 'Gameover Orders <onboarding@resend.dev>',
      to: ['miguelreynau.ia@gmail.com'],
      subject: `NUEVO PEDIDO RECIBIDO #${input.orderId}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb;">Nuevo Pedido Recibido</h2>
          <p><strong>Número de Pedido:</strong> #${input.orderId}</p>
          <p><strong>Método de Pago:</strong> ${paymentMethodLabel(input.paymentMethod)}</p>
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

// =============================================================================
// ABANDONED CART (customer filled info + triggered PaymentIntent, but never paid)
// =============================================================================
// Fires once per checkout session when the PaymentIntent is first created.
// Sends an email to the admin so they can follow up manually.

export async function sendAbandonedCartAction({
  customer,
  cartItems,
  total,
  orderId,
  paymentIntentId,
}: {
  customer: Customer;
  cartItems: CartItem[];
  total: number;
  orderId: string;
  paymentIntentId: string;
}): Promise<{ success: boolean; error: string | null }> {
  try {
    if (!resend) {
      console.log('--- SIMULANDO AVISO DE CARRITO PENDIENTE (RESEND NO CONFIGURADO) ---');
      return { success: true, error: null };
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'miguelreynau.ia@gmail.com';

    const itemsHtml = cartItems
      .map(
        (item) =>
          `<li>${item.name}${item.color ? ` (${item.color})` : ''} &mdash; x${item.quantity} &mdash; ${item.price.toFixed(0)}€</li>`
      )
      .join('');

    const { error } = await resend.emails.send({
      from: 'Gameover Pendientes <onboarding@resend.dev>',
      to: [adminEmail],
      subject: `🛒 Carrito pendiente de pago #${orderId} · ${total.toFixed(0)}€`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #ea580c;">Carrito pendiente de pago</h2>
          <p>
            Un cliente ha rellenado sus datos y ha iniciado el proceso de pago, pero
            aún no lo ha completado. Puedes contactarle para ofrecerle ayuda o un descuento.
          </p>

          <div style="background: #fff7ed; padding: 12px 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0;"><strong>Pedido provisional:</strong> #${orderId}</p>
            <p style="margin: 4px 0 0 0;"><strong>PaymentIntent:</strong> ${paymentIntentId}</p>
            <p style="margin: 4px 0 0 0;"><strong>Total:</strong> ${total.toFixed(0)}€</p>
          </div>

          <h3>Cliente</h3>
          <p style="margin: 0;"><strong>Nombre:</strong> ${customer.firstName}</p>
          <p style="margin: 4px 0 0 0;"><strong>Email:</strong> <a href="mailto:${customer.email}">${customer.email}</a></p>
          <p style="margin: 4px 0 0 0;"><strong>Teléfono:</strong> ${customer.phone || 'No proporcionado'}</p>

          <h3>Dirección</h3>
          <p style="margin: 0;">
            ${customer.address}${customer.apartment ? `, ${customer.apartment}` : ''}<br>
            ${customer.city}, ${customer.postalCode}<br>
            ${customer.country}
          </p>

          <h3>Artículos en el carrito</h3>
          <ul>${itemsHtml}</ul>

          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
          <p style="font-size: 12px; color: #9ca3af;">
            Aviso automático de Gameover. Solo se envía una vez por sesión de checkout.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending abandoned cart email:', error);
      return { success: false, error: 'No se pudo enviar el aviso.' };
    }
    return { success: true, error: null };
  } catch (e) {
    console.error('Exception in sendAbandonedCartAction:', e);
    return { success: false, error: e instanceof Error ? e.message : 'Error desconocido.' };
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
