
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { verifyStripePaymentAction } from '@/app/actions';

function methodLabel(t: string): string {
  switch (t) {
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
    default:
      return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
  }
}

function SuccessContent() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const paymentIntent = searchParams.get('payment_intent');
  const redirectStatus = searchParams.get('redirect_status');

  const [status, setStatus] = useState<'loading' | 'paid' | 'unpaid' | 'error' | 'no-session'>(
    paymentIntent ? 'loading' : 'no-session'
  );
  const [orderId, setOrderId] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    if (!paymentIntent) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await verifyStripePaymentAction(paymentIntent);
        if (cancelled) return;
        if (!res.success) {
          setStatus('error');
          return;
        }
        setOrderId(res.orderId);
        setTotal(res.total);
        setPaymentMethod(res.paymentMethodType);
        setStatus(res.paid ? 'paid' : 'unpaid');
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [paymentIntent]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <Loader2 className="w-12 h-12 animate-spin mb-6" />
        <h1 className="text-2xl font-semibold">Verificando tu pago...</h1>
        <p className="text-muted-foreground mt-2">Esto solo tardará unos segundos.</p>
      </div>
    );
  }

  if (status === 'error' || (status === 'unpaid' && redirectStatus !== 'succeeded')) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="w-20 h-20 text-amber-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4">No hemos podido confirmar tu pago</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-md">
          Si ves un cargo en tu cuenta, contáctanos por WhatsApp con tu correo electrónico y lo
          revisamos al instante.
        </p>
        <div className="flex gap-4">
          <Button asChild variant="default" size="lg">
            <Link href="/checkout">Volver al checkout</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <CheckCircle className="w-20 h-20 text-green-500 mb-6" data-testid="success-icon" />
      <h1 className="text-4xl font-bold mb-4">¡Gracias por tu compra!</h1>
      {orderId && (
        <p className="text-lg mb-2">
          Pedido <strong>#{orderId}</strong>
          {total > 0 ? ` · ${total.toFixed(0)}€` : ''}
          {paymentMethod ? ` · ${methodLabel(paymentMethod)}` : ''}
        </p>
      )}
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        {status === 'no-session'
          ? 'Tu pedido ha sido procesado con éxito. Recibirás un correo de confirmación en unos minutos.'
          : 'Pago confirmado. Recibirás un correo de confirmación en unos minutos.'}
      </p>
      <div className="flex gap-4">
        <Button asChild variant="default" size="lg">
          <Link href="/">Volver al inicio</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/localizar-pedido">Seguir mi pedido</Link>
        </Button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
