
'use client';

import { useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
      <h1 className="text-4xl font-bold mb-4">¡Gracias por tu compra!</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        Tu pedido ha sido procesado con éxito. Recibirás un correo de confirmación en unos minutos.
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
