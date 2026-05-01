
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { loadStripe, type Stripe as StripeJs } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
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
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  createPaymentIntentAction,
  updatePaymentIntentAmountAction,
  processFreeOrderAction,
  sendAbandonedCartAction,
} from '@/app/actions';
import { Loader2, Info, ShieldCheck } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const formSchema = z.object({
  email: z.string().email({ message: 'Correo electrónico inválido.' }),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(\+?34)?[\s-]?[67]\d{2}[\s-]?\d{3}[\s-]?\d{3}$/.test(val.trim()),
      { message: 'Teléfono español inválido. Debe empezar por 6 o 7 y tener 9 dígitos.' }
    ),
  firstName: z.string().min(1, 'El nombre es obligatorio.'),
  address: z.string().min(1, 'La dirección es obligatoria.'),
  apartment: z.string().optional(),
  city: z.string().min(1, 'La ciudad es obligatoria.'),
  postalCode: z.string().min(1, 'El código postal es obligatorio.'),
  country: z.string().min(1, 'El país es obligatorio.'),
});

type FormValues = z.infer<typeof formSchema>;

interface StripePaymentFormProps {
  totalAmount: number;
}

// Lazily create the Stripe instance only when the publishable key is available.
let stripePromise: Promise<StripeJs | null> | null = null;
function getStripe() {
  if (stripePromise) return stripePromise;
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    stripePromise = Promise.resolve(null);
  } else {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

export default function StripePaymentForm({ totalAmount }: StripePaymentFormProps) {
  const { cartItems } = useCart();
  const { toast } = useToast();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [creatingIntent, setCreatingIntent] = useState(false);
  const [intentError, setIntentError] = useState<string | null>(null);

  const isFreeOrder = totalAmount <= 0;
  const stripeInstance = useMemo(() => getStripe(), []);

  const form = useForm<FormValues>({
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

  const { watch } = form;
  const watchedEmail = watch('email');
  const watchedFirstName = watch('firstName');
  const watchedAddress = watch('address');
  const watchedCity = watch('city');
  const watchedPostalCode = watch('postalCode');

  // Detect if customer info is filled enough to create a PaymentIntent
  const customerReady =
    !!watchedEmail &&
    /^\S+@\S+\.\S+$/.test(watchedEmail) &&
    !!watchedFirstName &&
    !!watchedAddress &&
    !!watchedCity &&
    !!watchedPostalCode;

  // 1) Create the PaymentIntent the first time customer info is valid
  useEffect(() => {
    if (isFreeOrder) return;
    if (!customerReady) return;
    if (clientSecret) return;
    if (creatingIntent) return;
    if (cartItems.length === 0) return;

    setCreatingIntent(true);
    setIntentError(null);

    createPaymentIntentAction({
      customer: form.getValues(),
      cartItems,
      total: totalAmount,
    })
      .then((res) => {
        if (!res.success || !res.clientSecret) {
          setIntentError(res.error || 'No se pudo iniciar el pago.');
          return;
        }
        setClientSecret(res.clientSecret);
        setPaymentIntentId(res.paymentIntentId);
        setOrderId(res.orderId);

        // Fire-and-forget: send admin an abandoned-cart notice.
        // If the customer pays, they'll also receive the normal order email.
        if (res.paymentIntentId && res.orderId) {
          sendAbandonedCartAction({
            customer: form.getValues(),
            cartItems,
            total: totalAmount,
            orderId: res.orderId,
            paymentIntentId: res.paymentIntentId,
          }).catch((err) => console.warn('Abandoned-cart email failed:', err));
        }
      })
      .catch((e) => setIntentError(e instanceof Error ? e.message : 'Error iniciando pago.'))
      .finally(() => setCreatingIntent(false));
  }, [customerReady, clientSecret, creatingIntent, cartItems, totalAmount, isFreeOrder, form]);

  // 2) If totalAmount changes (coupon, qty), update the PaymentIntent amount
  const lastSyncedTotal = useRef<number | null>(null);
  useEffect(() => {
    if (!paymentIntentId) return;
    if (isFreeOrder) return;
    if (lastSyncedTotal.current === totalAmount) return;
    lastSyncedTotal.current = totalAmount;
    updatePaymentIntentAmountAction({ paymentIntentId, total: totalAmount }).catch((e) =>
      console.warn('Update PI amount failed:', e)
    );
  }, [paymentIntentId, totalAmount, isFreeOrder]);

  // === FREE ORDER (coupon mike2) ===
  if (isFreeOrder) {
    return (
      <FreeOrderForm form={form} cartItems={cartItems} totalAmount={totalAmount} />
    );
  }

  return (
    <div className="space-y-8">
      <CustomerInfoFields form={form} />

      <div className="space-y-3">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Método de Pago
          <ShieldCheck className="w-5 h-5 text-green-600" />
        </h2>
        <p className="text-sm text-muted-foreground">
          Pago seguro procesado por Stripe. Aceptamos tarjeta, Apple&nbsp;Pay, Google&nbsp;Pay y
          Bizum. Tus datos están encriptados.
        </p>

        {!customerReady && (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            Rellena tus datos de contacto y envío para continuar con el pago.
          </div>
        )}

        {customerReady && creatingIntent && (
          <div className="rounded-md border p-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando pasarela de pago…
          </div>
        )}

        {intentError && (
          <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
            {intentError}
          </div>
        )}

        {clientSecret && customerReady && (
          <>
            <div className="rounded-md border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
              <p className="font-semibold mb-1">
                ¿Vas a pagar con <span className="text-[#0099cc]">Bizum</span>?
              </p>
              <p>
                Despliega <strong>Bizum</strong> abajo e introduce el <strong>número de móvil
                asociado a tu cuenta Bizum</strong> (debe estar dado de alta en tu banco).
                Recibirás una notificación en tu app bancaria para autorizar el pago.
                Solo se aceptan móviles españoles (empiezan por 6 o 7, 9 dígitos).
              </p>
            </div>
            <Elements
              stripe={stripeInstance}
              options={{
                clientSecret,
                appearance: { theme: 'stripe', labels: 'floating' },
                locale: 'es',
              }}
            >
              <CheckoutInner
                form={form}
                orderId={orderId}
                totalAmount={totalAmount}
                toast={toast}
              />
            </Elements>
          </>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Customer Info Fields (shared)
// =============================================================================
function CustomerInfoFields({ form }: { form: ReturnType<typeof useForm<FormValues>> }) {
  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
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
                    Teléfono móvil
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            <strong>Imprescindible si pagas con Bizum</strong> — debe ser el
                            número asociado a tu cuenta Bizum. También nos permite que el
                            repartidor te contacte.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      inputMode="tel"
                      placeholder="6XX XXX XXX"
                      data-testid="checkout-phone-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Dirección de Envío</h2>
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
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input data-testid="checkout-address-input" {...field} />
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
      </form>
    </Form>
  );
}

// =============================================================================
// Inner checkout (with access to Stripe Elements)
// =============================================================================
function CheckoutInner({
  form,
  orderId,
  totalAmount,
  toast,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
  orderId: string | null;
  totalAmount: number;
  toast: ReturnType<typeof useToast>['toast'];
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleSubmit() {
    // Validate the address form first
    const valid = await form.trigger();
    if (!valid) {
      toast({
        variant: 'destructive',
        title: 'Faltan datos',
        description: 'Por favor, revisa los campos del formulario.',
      });
      return;
    }
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const values = form.getValues();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const returnUrl = `${origin}/checkout/success${
      orderId ? `?order_id=${orderId}` : ''
    }`;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
        receipt_email: values.email,
        payment_method_data: {
          billing_details: {
            name: values.firstName,
            email: values.email,
            phone: values.phone || undefined,
            address: {
              line1: values.address,
              line2: values.apartment || undefined,
              city: values.city,
              postal_code: values.postalCode,
              country: 'ES',
            },
          },
        },
      },
    });

    // If we get here without redirect, it failed.
    if (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo completar el pago',
        description: error.message || 'Revisa los datos de pago e inténtalo de nuevo.',
      });
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-4">
      <PaymentElement
        options={{
          layout: { type: 'accordion', defaultCollapsed: false, radios: 'never', spacedAccordionItems: true },
        }}
      />
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!stripe || isProcessing}
        size="lg"
        className="w-full bg-black text-white hover:bg-black/90"
        data-testid="checkout-submit-btn"
      >
        {isProcessing ? <Loader2 className="animate-spin" /> : `Pagar ${totalAmount.toFixed(0)}€`}
      </Button>
    </div>
  );
}

// =============================================================================
// Free order (coupon makes the total = 0)
// =============================================================================
function FreeOrderForm({
  form,
  cartItems,
  totalAmount,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
  cartItems: Array<{
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    color?: string;
    isUpsell?: boolean;
  }>;
  totalAmount: number;
}) {
  const { clearCartAndOrder } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleConfirm() {
    const valid = await form.trigger();
    if (!valid) return;
    setIsProcessing(true);

    const values = form.getValues();
    try {
      const res = await processFreeOrderAction({
        customer: { ...values, phone: values.phone || undefined },
        cartItems,
        total: totalAmount,
      });
      if (!res.success || !res.orderId) {
        throw new Error(res.error || 'Error procesando el pedido.');
      }
      clearCartAndOrder({
        customer: { ...values, phone: values.phone || undefined },
        orderId: res.orderId,
        paymentMethod: 'card',
        total: totalAmount,
      });
      toast({ title: '¡Pedido realizado!', description: 'Gracias. Te estamos redirigiendo...' });
      router.push('/thank-you');
    } catch (e: unknown) {
      toast({
        variant: 'destructive',
        title: 'Error en el Pedido',
        description: e instanceof Error ? e.message : 'Error desconocido',
      });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-8">
      <CustomerInfoFields form={form} />
      <Button
        type="button"
        onClick={handleConfirm}
        disabled={isProcessing}
        size="lg"
        className="w-full bg-black text-white hover:bg-black/90"
        data-testid="checkout-submit-btn"
      >
        {isProcessing ? <Loader2 className="animate-spin" /> : 'Confirmar Pedido'}
      </Button>
    </div>
  );
}
