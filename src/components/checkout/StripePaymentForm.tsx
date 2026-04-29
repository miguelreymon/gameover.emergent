
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { processOrderAction } from '@/app/actions';
import { Loader2, Info, CreditCard, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { PaymentMethod } from '@/app/checkout/page';

const formSchema = z.object({
  email: z.string().email({ message: 'Correo electrónico inválido.' }),
  phone: z.string().optional(),
  firstName: z.string().min(1, 'El nombre es obligatorio.'),
  address: z.string().min(1, 'La dirección es obligatoria.'),
  apartment: z.string().optional(),
  city: z.string().min(1, 'La ciudad es obligatoria.'),
  postalCode: z.string().min(1, 'El código postal es obligatorio.'),
  country: z.string().min(1, 'El país es obligatorio.'),
});

interface StripePaymentFormProps {
  totalAmount: number;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  isDiscountApplied: boolean;
}

export default function StripePaymentForm({
  totalAmount,
  paymentMethod,
  setPaymentMethod,
}: StripePaymentFormProps) {
  const { cartItems, clearCartAndOrder } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);

  const isFreeOrder = totalAmount <= 0;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      phone: '',
      firstName: '',
      address: '',
      apartment: '',
      city: '',
      postalCode: '',
      country: 'España',
    },
  });

  async function handlePayment(values: z.infer<typeof formSchema>) {
    setIsProcessing(true);

    const orderPayload = {
      customer: {
        ...values,
        phone: values.phone || undefined,
      },
      cartItems: cartItems,
      total: totalAmount,
    };

    try {
      const result = await processOrderAction({
        payment: {
          paymentMethod: isFreeOrder ? 'bizum' : paymentMethod,
          currency: 'EUR',
        },
        order: orderPayload,
        origin: typeof window !== 'undefined' ? window.location.origin : undefined,
      });

      if (!result.success) {
        throw new Error(result.error || 'No se pudo procesar el pedido.');
      }

      // Card payment via Stripe Checkout: redirect to hosted page
      if (result.redirectUrl && paymentMethod === 'card' && !isFreeOrder) {
        // Save minimal order details so /thank-you can pick them up if needed.
        const orderDetails = {
          customer: orderPayload.customer,
          orderId: result.orderId || '',
          paymentMethod: 'card' as const,
          total: totalAmount,
        };
        clearCartAndOrder(orderDetails);
        window.location.href = result.redirectUrl;
        return;
      }

      // Bizum / Free order: continue with the existing thank-you flow
      if (result.orderId) {
        const orderDetails = {
          customer: orderPayload.customer,
          orderId: result.orderId,
          paymentMethod: paymentMethod,
          total: totalAmount,
        };
        clearCartAndOrder(orderDetails);
        toast({
          title: '¡Pedido realizado!',
          description: 'Gracias por tu compra. Te estamos redirigiendo...',
        });
        router.push('/thank-you');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error en el pedido';
      toast({
        variant: 'destructive',
        title: 'Error en el Pedido',
        description: message,
      });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handlePayment)} className="space-y-8" data-testid="checkout-form">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Información de Contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="tu@email.com" data-testid="checkout-email-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Teléfono
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Aconsejable para que el repartidor pueda contactarte si hay algún problema.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Input data-testid="checkout-phone-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Dirección de Envío</h2>
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre y Apellidos</FormLabel>
                  <FormControl>
                    <Input data-testid="checkout-firstname-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input placeholder="" data-testid="checkout-address-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciudad</FormLabel>
                  <FormControl>
                    <Input data-testid="checkout-city-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código Postal</FormLabel>
                  <FormControl>
                    <Input data-testid="checkout-postal-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>País</FormLabel>
                  <FormControl>
                    <Input data-testid="checkout-country-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {!isFreeOrder && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Método de Pago</h2>

            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
              className="grid grid-cols-1 gap-4"
            >
              <Label
                htmlFor="card-payment"
                data-testid="payment-method-card"
                className={cn(
                  'flex flex-col rounded-lg border-2 p-4 cursor-pointer bg-white',
                  {
                    'border-primary ring-2 ring-primary': paymentMethod === 'card',
                    'border-muted hover:border-muted-foreground': paymentMethod !== 'card',
                  }
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="card" id="card-payment" />
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      <span className="font-semibold">Pago con Tarjeta</span>
                    </div>
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Info className="w-3 h-3" />
                    <span>
                      Pago seguro procesado por Stripe. Serás redirigido a su pasarela para completar el
                      pago. Tus datos están encriptados.
                    </span>
                  </div>
                )}
              </Label>

              <Label
                htmlFor="bizum-payment"
                data-testid="payment-method-bizum"
                className={cn(
                  'flex items-center justify-between rounded-lg border-2 p-4 cursor-pointer bg-white',
                  {
                    'border-primary ring-2 ring-primary': paymentMethod === 'bizum',
                    'border-muted hover:border-muted-foreground': paymentMethod !== 'bizum',
                  }
                )}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="bizum" id="bizum-payment" />
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    <span className="font-semibold">Pago con Bizum</span>
                  </div>
                </div>
                <span className="font-bold text-green-600">-10% EXTRA</span>
              </Label>
            </RadioGroup>

            {paymentMethod === 'bizum' && (
              <div className="text-sm text-muted-foreground bg-secondary p-3 rounded-md border-l-4 border-primary">
                <div className="flex items-center gap-2 mb-2 text-foreground font-bold">
                  <Info className="w-4 h-4" />
                  <span>Instrucciones de Pago</span>
                </div>
                Una vez confirmado el pedido, deberás realizar un Bizum al número{' '}
                <strong className="text-foreground">680414307</strong>.
                <br />
                <br />
                <strong className="text-foreground">Importante:</strong> En el concepto del Bizum, indica tu{' '}
                <strong className="text-foreground">Nombre y Apellidos</strong> o el{' '}
                <strong className="text-foreground">Número de Pedido</strong> que aparecerá en la siguiente
                pantalla.
                <br />
                <br />
                Una vez verificado el pago, procederemos al envío inmediato de tu consola.
              </div>
            )}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-black text-white hover:bg-black/90"
          size="lg"
          disabled={isProcessing}
          data-testid="checkout-submit-btn"
        >
          {isProcessing ? (
            <Loader2 className="animate-spin" />
          ) : isFreeOrder ? (
            'Confirmar Pedido'
          ) : paymentMethod === 'bizum' ? (
            `Confirmar Pedido (${totalAmount.toFixed(0)}€)`
          ) : (
            `Pagar ${totalAmount.toFixed(0)}€`
          )}
        </Button>
      </form>
    </Form>
  );
}
