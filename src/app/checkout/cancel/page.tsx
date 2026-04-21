
'use client';

import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CancelPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <XCircle className="w-20 h-20 text-destructive mb-6" />
      <h1 className="text-4xl font-bold mb-4">Pago cancelado</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        No se ha realizado ningún cargo. Si has tenido algún problema, puedes intentarlo de nuevo.
      </p>
      <Button asChild variant="default" size="lg">
        <Link href="/checkout">Volver al checkout</Link>
      </Button>
    </div>
  );
}
