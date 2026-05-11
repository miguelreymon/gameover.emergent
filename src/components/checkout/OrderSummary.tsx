
'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { getImage } from '@/lib/images';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, Gift } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface OrderSummaryProps {
  discount: number;
  bizumDiscount?: number;
  shippingFee: number;
  couponCode: string;
  setCouponCode: (code: string) => void;
  handleApplyCoupon: () => void;
}

export default function OrderSummary({
  discount,
  bizumDiscount = 0,
  shippingFee,
  couponCode,
  setCouponCode,
  handleApplyCoupon,
}: OrderSummaryProps) {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <p>Cargando resumen...</p>;
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + shippingFee - discount - bizumDiscount;

  return (
    <div className="space-y-6">
      <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
        {cartItems.map(item => (
          <div key={item.id} className="flex items-start justify-between space-x-4">
            <div className="flex items-start space-x-4 flex-grow">
              <div className="relative">
                <Image
                  src={getImage(item.image)}
                  alt={item.name}
                  width={item.isUpsell ? 48 : 80}
                  height={item.isUpsell ? 48 : 80}
                  className="rounded-md object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-grow">
                <p className="font-medium leading-tight">{item.name}</p>
                {item.color && (
                  <Badge variant={item.isUpsell ? 'default' : 'secondary'} className={cn('mt-1', item.isUpsell ? 'bg-green-600' : '')}>
                      {item.isUpsell && <Gift className="mr-1 h-3 w-3" />}
                      {item.color}
                  </Badge>
                )}
                 {!item.isUpsell && (
                    <div className="flex items-center space-x-2 mt-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                            <Minus className="h-3 w-3" />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>
                )}
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
                {item.price > 0 && (
                    <p className="font-semibold whitespace-nowrap">{(item.price * item.quantity).toFixed(0)}€</p>
                )}
                {!item.isUpsell && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 mt-1 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromCart(item.id)}
                    >
                        <Trash2 className='h-4 w-4' />
                    </Button>
                )}
            </div>
          </div>
        ))}
      </div>
      <Separator />
      <div className="flex space-x-2">
        <Input
          placeholder="Código de descuento"
          value={couponCode}
          onChange={e => setCouponCode(e.target.value)}
          className="text-sm"
        />
        <Button onClick={handleApplyCoupon} variant="outline" className="whitespace-nowrap">
          Aplicar
        </Button>
      </div>
      <Separator />
      <div className="space-y-2">
        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>{subtotal.toFixed(0)}€</p>
        </div>
        <div className="flex justify-between">
          <p>Envío y gestión</p>
          <p>{shippingFee === 0 ? 'Gratis' : `${shippingFee.toFixed(0)}€`}</p>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600 font-medium">
            <p>Descuento</p>
            <p>-{discount.toFixed(0)}€</p>
          </div>
        )}
        {bizumDiscount > 0 && (
          <div className="flex justify-between text-green-600 font-medium">
            <p>Descuento Bizum (10%)</p>
            <p>-{bizumDiscount.toFixed(0)}€</p>
          </div>
        )}
      </div>
      <Separator />
      <div className="flex justify-between font-bold text-lg">
        <p>Total</p>
        <p>{total > 0 ? total.toFixed(0) : 0}€</p>
      </div>
    </div>
  );
}
