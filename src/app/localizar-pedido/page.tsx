
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { XCircle } from 'lucide-react';

export default function TrackOrderPage() {
  const [showError, setShowError] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setShowError(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 lg:py-16 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Localiza tu Pedido</CardTitle>
          <CardDescription>
            Introduce tu número de pedido y tu email o teléfono para ver el estado de tu envío.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="orderId">Número de Pedido</Label>
              <Input id="orderId" placeholder="Ej: sq_xxxxxx" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailPhone">Email o Teléfono</Label>
              <Input
                id="emailPhone"
                placeholder="El que usaste en la compra"
              />
            </div>
            {showError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  No hemos encontrado ningún pedido que coincida con los datos introducidos. Por favor, revisa la información.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Localizar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
