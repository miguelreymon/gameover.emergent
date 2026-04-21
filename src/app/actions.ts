
'use server';

import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Resend } from 'resend';

import { Client, Environment } from 'square';
import { randomUUID } from 'crypto';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const squareClient = process.env.SQUARE_ACCESS_TOKEN ? new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.NEXT_PUBLIC_SQUARE_APP_ID?.startsWith('sandbox') ? Environment.Sandbox : Environment.Production,
}) : null;

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
  sourceId: z.string().optional(),
  currency: z.string().default('EUR'),
  totalAmount: z.number(),
  customer: CustomerSchema,
  cartItems: z.array(CartItemSchema),
});

export type ProcessOrderInput = z.infer<typeof ProcessOrderInputSchema>;

const ProcessOrderOutputSchema = z.object({
  success: z.boolean(),
  orderId: z.string().nullable(),
  transactionId: z.string().nullable(),
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

export async function processOrderAction({
  payment,
  order,
}: {
  payment: Omit<ProcessOrderInput, 'customer' | 'cartItems' | 'totalAmount'>;
  order: OrderPayload;
}): Promise<ProcessOrderOutput> {
  try {
    const displayOrderId = Math.floor(1000 + Math.random() * 9000).toString();
    let transactionId = `dummy_tx_${Date.now()}`;

    // Handle real Square payment if sourceId is provided and client is configured
    if (payment.sourceId && payment.sourceId !== 'bizum' && payment.sourceId !== 'cod' && squareClient) {
      try {
        const { result } = await squareClient.paymentsApi.createPayment({
          sourceId: payment.sourceId,
          idempotencyKey: randomUUID(),
          amountMoney: {
            amount: BigInt(Math.round(order.total * 100)), // Convert to cents and BigInt
            currency: 'EUR',
          },
          note: `Pedido #${displayOrderId} - ${order.customer.email}`,
          statementDescriptionIdentifier: 'GAMEOVER',
        });

        transactionId = result.payment?.id || transactionId;
      } catch (squareError: any) {
        console.error('Square Payment Error:', squareError);
        const errorMsg = squareError.errors?.[0]?.detail || 'Error en el procesamiento del pago con tarjeta.';
        return {
          success: false,
          orderId: null,
          transactionId: null,
          error: errorMsg,
        };
      }
    }

    console.log('--- PROCESANDO PEDIDO ---');
    console.log('ID Pedido:', displayOrderId);
    
    // Send notifications
    await Promise.all([
      sendOrderNotification({ ...order, orderId: displayOrderId, paymentMethod: payment.sourceId }),
      sendCustomerEmail({ ...order, orderId: displayOrderId, paymentMethod: payment.sourceId })
    ]);

    return {
      success: true,
      orderId: displayOrderId,
      transactionId: transactionId,
      error: null,
    };
  } catch (error) {
    console.error('Error processing order action:', error);
    return {
      success: false,
      orderId: null,
      transactionId: null,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

async function sendCustomerEmail(input: OrderPayload & { orderId: string, paymentMethod?: string }): Promise<void> {
  if (!resend) {
    console.log('--- SIMULANDO ENVÍO DE EMAIL (RESEND_API_KEY NO CONFIGURADA) ---');
    console.log('Destinatario:', input.customer.email);
    return;
  }

  try {
    const itemsHtml = input.cartItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} ${item.color ? `(${item.color})` : ''}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toFixed(0)}€</td>
      </tr>
    `).join('');

    const bizumInstructions = input.paymentMethod === 'bizum' ? `
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <h3 style="color: #1e40af; margin-top: 0;">Instrucciones de Pago Bizum</h3>
        <p>Has seleccionado el pago vía Bizum. Para que podamos procesar tu pedido, por favor realiza el pago de <strong>${input.total.toFixed(0)}€</strong> al siguiente número:</p>
        <div style="text-align: center; font-size: 24px; font-weight: bold; padding: 10px; background: white; border-radius: 5px; margin: 10px 0; border: 1px dashed #3b82f6;">
          680414307
        </div>
        <p style="font-size: 14px; margin-bottom: 0;"><strong>Concepto:</strong> #${input.orderId}</p>
        <p style="font-size: 12px; color: #6b7280; margin-top: 5px;">* Es muy importante incluir el número de pedido en el concepto.</p>
      </div>
    ` : '';

    const paymentMethodText = input.paymentMethod === 'bizum' ? 'Bizum' : 
                             input.paymentMethod === 'cod' ? 'Contrareembolso' : 
                             'Tarjeta';

    const { data, error } = await resend.emails.send({
      from: 'Gameover <onboarding@resend.dev>', // In production, use your verified domain
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

async function sendOrderNotification(input: OrderPayload & { orderId: string, paymentMethod?: string }): Promise<void> {
  if (!resend) {
    console.log('--- SIMULANDO NOTIFICACIÓN DE PEDIDO (RESEND_API_KEY NO CONFIGURADA) ---');
    return;
  }

  try {
    const paymentMethodName = input.paymentMethod === 'bizum' ? 'Bizum' : 
                             input.paymentMethod === 'cod' ? 'Contrareembolso' : 
                             'Tarjeta';

    const itemsHtml = input.cartItems.map(item => `
      <li>${item.name} (x${item.quantity}) - ${item.price.toFixed(0)}€</li>
    `).join('');

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
    // Simulate verification
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
