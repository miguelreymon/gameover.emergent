
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
import { CheckCircle2, Loader2, MapPin, Package, Truck, XCircle } from 'lucide-react';
import { lookupFakeOrderAction, type FakeOrderPublic } from '@/app/actions';

export default function TrackOrderPage() {
  const [trackingCode, setTrackingCode] = useState('');
  const [contact, setContact] = useState('');
  const [order, setOrder] = useState<FakeOrderPublic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);
    const res = await lookupFakeOrderAction(trackingCode, contact);
    setLoading(false);
    if (res.success && res.order) {
      setOrder(res.order);
    } else {
      setError(res.error || 'No se ha podido localizar el pedido.');
    }
  };

  const reset = () => {
    setOrder(null);
    setError(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 lg:py-16 max-w-3xl">
      {!order ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Localiza tu Pedido</CardTitle>
            <CardDescription>
              Introduce tu código de seguimiento y tu email, teléfono o código postal para ver el
              estado de tu envío.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="trackingCode">Código de seguimiento</Label>
                <Input
                  id="trackingCode"
                  placeholder="Ej: GO-1A2B-3C4D"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  required
                  data-testid="track-order-code-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Email, teléfono o código postal</Label>
                <Input
                  id="contact"
                  placeholder="El que usaste en la compra"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  required
                  data-testid="track-order-contact-input"
                />
              </div>
              {error && (
                <Alert variant="destructive" data-testid="track-order-error">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                data-testid="track-order-submit"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Buscando…
                  </span>
                ) : (
                  'Localizar'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <OrderProgress order={order} onReset={reset} />
      )}
    </div>
  );
}

function OrderProgress({ order, onReset }: { order: FakeOrderPublic; onReset: () => void }) {
  const { stages, currentStage } = order;
  const total = stages.length;
  // Progress fill (0% on first stage, 100% on last stage)
  const progressPct = total <= 1 ? 100 : (currentStage / (total - 1)) * 100;
  const isDelivered = currentStage >= total - 1;
  const currentLabelNorm = (stages[currentStage] || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
  const isPickedUp = currentLabelNorm.startsWith('recogid');

  return (
    <div className="space-y-6" data-testid="track-order-result">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-2xl font-bold">
                {isDelivered ? 'Pedido entregado' : 'Tu pedido está en camino'}
              </CardTitle>
              <CardDescription>
                {order.customerFirstName
                  ? `Hola ${order.customerFirstName}, este es el estado de tu envío.`
                  : 'Este es el estado actual de tu envío.'}
              </CardDescription>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="text-sm underline text-slate-600 hover:text-slate-900"
              data-testid="track-order-back"
            >
              Buscar otro
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Progress bar */}
          <div>
            <div className="relative pt-6 pb-2">
              {/* track */}
              <div className="absolute left-0 right-0 top-[34px] h-1.5 bg-slate-200 rounded-full" />
              {/* fill */}
              <div
                className="absolute left-0 top-[34px] h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `calc(${progressPct}% )`,
                  backgroundColor: 'hsl(var(--primary))',
                }}
                data-testid="track-order-progress-fill"
              />
              {/* dots */}
              <div className="relative flex justify-between">
                {stages.map((label, i) => {
                  const done = i <= currentStage;
                  const isCurrent = i === currentStage;
                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center text-center flex-1"
                      data-testid={`track-order-stage-${i}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm border-2 ${
                          done
                            ? 'text-white'
                            : 'bg-white text-slate-400 border-slate-300'
                        }`}
                        style={
                          done
                            ? {
                                backgroundColor: 'hsl(var(--primary))',
                                borderColor: 'hsl(var(--primary))',
                              }
                            : undefined
                        }
                      >
                        {done ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span className="text-[11px] font-bold">{i + 1}</span>
                        )}
                      </div>
                      <span
                        className={`mt-2 text-[11px] sm:text-xs leading-tight max-w-[90px] ${
                          isCurrent ? 'font-bold text-slate-900' : done ? 'text-slate-700' : 'text-slate-400'
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Current status callout */}
          <div className="rounded-lg border bg-slate-50 p-4 flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: 'hsl(var(--primary))' }}
            >
              {isDelivered ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : currentStage >= total - 2 ? (
                <Truck className="w-5 h-5" />
              ) : currentStage >= 2 ? (
                <Package className="w-5 h-5" />
              ) : (
                <MapPin className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Estado actual</p>
              <p className="font-bold text-lg leading-tight">{stages[currentStage]}</p>
              {isPickedUp && (
                <p
                  className="text-sm text-slate-700 mt-2 leading-relaxed"
                  data-testid="track-order-pickedup-note"
                >
                  Tu pedido ya ha sido recogido por la empresa de transporte. En el momento en
                  que procesen el paquete en sus instalaciones recibirás por email el número de
                  seguimiento de la empresa de transporte para que puedas hacer el seguimiento
                  detallado del envío.
                </p>
              )}
              {order.estimatedDelivery && !isDelivered && (
                <p className="text-sm text-slate-600 mt-1">
                  Entrega estimada: <strong>{order.estimatedDelivery}</strong>
                </p>
              )}
              {isDelivered && (
                <p className="text-sm text-slate-600 mt-1">
                  Tu pedido ha sido entregado. ¡Que lo disfrutes!
                </p>
              )}
            </div>
          </div>

          {/* Order details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-slate-500">Código de seguimiento</p>
              <p className="font-mono font-semibold">{order.trackingCode}</p>
            </div>
            {order.carrier && (
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-slate-500">Transportista</p>
                <p className="font-semibold">{order.carrier}</p>
              </div>
            )}
            {order.product && (
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-slate-500">Producto</p>
                <p className="font-semibold">{order.product}</p>
              </div>
            )}
            {order.total && (
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-slate-500">Total</p>
                <p className="font-semibold">{order.total}</p>
              </div>
            )}
            {(order.city || order.postalCode) && (
              <div className="space-y-1 sm:col-span-2">
                <p className="text-xs uppercase tracking-wider text-slate-500">Dirección de envío</p>
                <p className="font-semibold">
                  {[order.city, order.postalCode].filter(Boolean).join(' · ')}
                  {order.country ? ` · ${order.country}` : ''}
                </p>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Si tienes alguna duda sobre tu envío, contáctanos desde la página de Contacto o por
            WhatsApp y te ayudaremos al momento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
