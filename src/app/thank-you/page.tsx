'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Loader2, Smartphone, Copy, Check, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import type { CartItem } from '@/context/CartContext';

interface OrderDetails {
  customer: {
    email: string;
    phone?: string;
    firstName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  orderId: string;
  paymentMethod?: string;
  total?: number;
}

export default function ThankYouPage() {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  useEffect(() => {
    try {
      const storedOrder = localStorage.getItem('lastOrder');
      if (storedOrder) {
        const orderData: OrderDetails = JSON.parse(storedOrder);
        setOrderDetails(orderData);
        // Clear local storage after reading it to prevent re-showing the same order details
        localStorage.removeItem('lastOrder');
      }
    } catch (error) {
      console.error("Failed to parse order details from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
         <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p>Cargando confirmación de pedido...</p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <CardTitle className="text-3xl font-bold">¡Gracias por tu compra!</CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                    Hemos recibido tu pedido y te hemos enviado un correo de confirmación.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>Si no encuentras los detalles de tu pedido, revisa tu bandeja de entrada.</p>
                <Button asChild className="mt-6">
                    <Link href="/">Volver a la tienda</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }
  
  const { customer, orderId } = orderDetails;

  return (
    <div className="bg-secondary min-h-screen">
        <div className="container mx-auto px-4 py-8 lg:py-16">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader className="text-center space-y-4">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                        <CardTitle className="text-3xl font-bold">¡Gracias por tu pedido, {customer.firstName}!</CardTitle>
                        <CardDescription className="text-lg text-muted-foreground">
                            Hemos recibido tu pedido y te hemos enviado un correo de confirmación.
                        </CardDescription>
                         <p className="text-sm text-muted-foreground">
                            Número de Pedido: <strong>#{orderId}</strong>
                        </p>
                    </CardHeader>
                    <CardContent className="mt-6">
                        {orderDetails.paymentMethod === 'bizum' && (
                            <div className="mb-8 p-6 bg-primary/5 border-2 border-primary/20 rounded-xl text-center max-w-md mx-auto">
                                <h3 className="text-xl font-bold text-primary mb-4 flex items-center justify-center gap-2">
                                    <Smartphone className="w-6 h-6" />
                                    Instrucciones Bizum
                                </h3>
                                <p className="mb-2 text-sm text-muted-foreground">
                                    Realiza el pago de:
                                </p>
                                <div className="flex items-center justify-center gap-2 mb-6">
                                    <span className="text-2xl font-black">{(orderDetails.total?.toFixed(0) || '---')}€</span>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8" 
                                        onClick={() => copyToClipboard(orderDetails.total?.toFixed(0) || '', 'total')}
                                    >
                                        {copiedField === 'total' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>

                                <p className="mb-2 text-sm text-muted-foreground">Al número de teléfono:</p>
                                <div className="flex items-center justify-center gap-2 mb-6">
                                    <div className="text-3xl font-black tracking-wider bg-white px-4 py-2 rounded-lg shadow-sm border border-primary/10">
                                        680414307
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        className="h-12 w-12 rounded-lg"
                                        onClick={() => copyToClipboard('680414307', 'phone')}
                                    >
                                        {copiedField === 'phone' ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                                    </Button>
                                </div>

                                <div className="space-y-4 text-sm text-left bg-white/50 p-4 rounded-lg border border-primary/5">
                                    <div className="flex items-center justify-between">
                                        <p className="flex gap-2">
                                            <span className="font-bold text-primary">Concepto:</span>
                                            <strong className="text-foreground">#{orderId}</strong>
                                        </p>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-7 px-2"
                                            onClick={() => copyToClipboard(`#${orderId}`, 'concept')}
                                        >
                                            {copiedField === 'concept' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                                            <span className="ml-1 text-[10px] uppercase font-bold">Copiar</span>
                                        </Button>
                                    </div>
                                    <p className="text-[11px] leading-tight text-muted-foreground italic">
                                        * Es muy importante poner el número de pedido en el concepto para validar tu compra.
                                    </p>
                                </div>

                                <div className="mt-6 pt-6 border-t border-primary/10">
                                    <p className="text-xs mb-3 text-muted-foreground">¿Ya has hecho el pago? Envíanos el comprobante:</p>
                                    <Button 
                                        variant="outline" 
                                        className="w-full bg-green-50 hover:bg-green-100 border-green-200 text-green-700 gap-2"
                                        asChild
                                    >
                                        <a 
                                            href={`https://wa.me/34680414307?text=${encodeURIComponent(`Hola, acabo de realizar el pedido #${orderId} por ${orderDetails.total?.toFixed(0)}€ vía Bizum. Aquí tienes el comprobante.`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            Enviar comprobante por WhatsApp
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        )}
                        <div className="space-y-6 bg-slate-50 p-6 rounded-lg max-w-md mx-auto">
                             <h3 className="text-xl font-semibold">Información de Envío</h3>
                             <div>
                                 <h4 className='font-semibold'>Contacto</h4>
                                 <p className='text-muted-foreground'>{customer.email}</p>
                                 {customer.phone && <p className='text-muted-foreground'>{customer.phone}</p>}
                             </div>
                             <div>
                                 <h4 className='font-semibold'>Dirección de envío</h4>
                                 <address className='text-muted-foreground not-italic'>
                                     {customer.firstName}<br/>
                                     {customer.address}<br/>
                                     {customer.city}, {customer.postalCode}<br/>
                                     {customer.country}
                                 </address>
                             </div>
                        </div>
                    </CardContent>
                </Card>
                <div className="text-center mt-8">
                     <Button asChild>
                        <Link href="/">Seguir Comprando</Link>
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );
}
