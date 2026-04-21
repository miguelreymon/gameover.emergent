
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { getImage } from '@/lib/images';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, Trash2, Gift } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

export function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
  } = useCart();
  const [isClient, setIsClient] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const router = useRouter();
  const { toast } = useToast();


  useEffect(() => {
    setIsClient(true);
  }, []);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  const mainCartItems = cartItems.filter(item => !item.isUpsell);

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push('/checkout');
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>Tu Carrito</SheetTitle>
        </SheetHeader>
        <Separator />
        {!isClient ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground">Cargando carrito...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground">Tu carrito está vacío.</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-6 p-6">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-start space-x-4">
                    <Image
                      src={getImage(item.image)}
                      alt={item.name}
                      width={item.isUpsell ? 48 : 80}
                      height={item.isUpsell ? 48 : 80}
                      className="rounded-md object-cover"
                      unoptimized
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      {item.color && (
                        <Badge variant={item.isUpsell ? 'default' : 'secondary'} className={cn('mt-1', item.isUpsell ? 'bg-green-600' : '')}>
                          {item.isUpsell && <Gift className="mr-1 h-3 w-3" />}
                          {item.color}
                        </Badge>
                      )}
                       <p className="text-sm font-semibold mt-1">
                        {item.price > 0 ? `${item.price.toFixed(0)}€` : 'Gratis'}
                      </p>
                      {!item.isUpsell && (
                        <div className="flex items-center space-x-2 mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span>{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {!item.isUpsell && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator />
            <SheetFooter className="p-6 bg-secondary">
              <div className="w-full space-y-4">
                <div className="flex justify-between font-semibold">
                  <span>Subtotal</span>
                  <span>{subtotal.toFixed(0)}€</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Impuestos y envío calculados en la pantalla de pago.
                </p>
                <Button
                  className="w-full bg-black text-white hover:bg-black/90"
                  onClick={handleCheckout}
                  disabled={isCheckingOut || mainCartItems.length === 0}
                >
                  {isCheckingOut ? 'Redirigiendo...' : 'Finalizar Compra'}
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
