
'use client';

import { useState, useEffect } from 'react';
import SquarePaymentForm from '@/components/checkout/SquarePaymentForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export type PaymentMethod = 'card' | 'cod' | 'bizum';

export default function CheckoutPage() {
  const { cartItems } = useCart();
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);

  useEffect(() => {
    if (isDiscountApplied) {
      setPaymentMethod('card');
    }
  }, [isDiscountApplied]);

  useEffect(() => {
    // Check if Square SDK is loaded
    const checkSdk = () => {
      if ((window as any).Square) {
        setIsSdkLoaded(true);
      } else {
        setTimeout(checkSdk, 500);
      }
    };
    checkSdk();
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = 0; // COD hidden, shipping is free or handled elsewhere
  const baseTotal = subtotal + shippingFee - discount;
  const bizumDiscount = paymentMethod === 'bizum' ? baseTotal * 0.1 : 0;
  const total = baseTotal - bizumDiscount;

  const handleApplyCoupon = () => {
    const currentTotal = subtotal + shippingFee;
    if (couponCode.toLowerCase() === 'mike') {
      const newDiscount = currentTotal > 1 ? currentTotal - 1 : 0;
      setDiscount(newDiscount);
      setIsDiscountApplied(true);
      toast({
        title: '¡Cupón de Leyenda aplicado!',
        description: `Has conseguido la consola por solo 1€.`,
      });
    } else if (couponCode.toLowerCase() === 'mike2') {
      const newDiscount = currentTotal;
      setDiscount(newDiscount);
      setIsDiscountApplied(true);
      toast({
        title: '¡Cupón de Dios aplicado!',
        description: '¡Mamma Mia! Tu pedido es totalmente gratis.',
      });
    } else if (couponCode.toLowerCase() === 'extra20') {
      const newDiscount = 10;
      setDiscount(newDiscount);
      setIsDiscountApplied(true);
      toast({
        title: '¡Cupón aplicado!',
        description: 'Has conseguido un descuento de 10€.',
      });
    } else {
      setDiscount(0);
      setIsDiscountApplied(false);
      toast({
        variant: 'destructive',
        title: 'Cupón no válido',
        description: 'El código de cupón introducido no es correcto.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-secondary p-8 rounded-lg h-fit lg:order-1">
            <h2 className="text-2xl font-bold mb-6">Resumen del Pedido</h2>
            <OrderSummary
              discount={discount}
              bizumDiscount={bizumDiscount}
              shippingFee={shippingFee}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              handleApplyCoupon={handleApplyCoupon}
            />
          </div>
          <div className="lg:order-2">
            <h1 className="text-3xl font-bold mb-6">Información y Pago</h1>
            <SquarePaymentForm 
              appId={process.env.NEXT_PUBLIC_SQUARE_APP_ID || 'sandbox-sq-dummy'} 
              locationId={process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || 'dummy-location'}
              totalAmount={total} 
              isSdkLoaded={isSdkLoaded}
              paymentMethod={paymentMethod} 
              setPaymentMethod={setPaymentMethod} 
              isDiscountApplied={isDiscountApplied}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
