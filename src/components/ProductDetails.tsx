
'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import type { Product, ProductVariant } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  ShoppingBag,
  Truck,
  Package,
  Gift,
  Gamepad2,
  ShieldCheck,
  Tv,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ProductInfoAccordion from './ProductInfoAccordion';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import CustomerReviewsCarousel from './CustomerReviewsCarousel';
import { useRouter } from 'next/navigation';
import { siteContent } from '@/lib/content';
import { getImage } from '@/lib/images';

interface ProductDetailsProps {
  product: Product;
}

function CountdownTimer({ offer }: { offer: Product['countdownOffer'] }) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    hasExpired?: boolean;
  } | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!offer || !isClient) return;

    const getInitialTimeLeft = () => {
      const storedEndTime = localStorage.getItem('offerEndTime');
      let endTime: number;

      if (!storedEndTime || parseInt(storedEndTime, 10) < new Date().getTime()) {
        endTime = new Date().getTime() + 2 * 60 * 60 * 1000; // 2 hours from now
        localStorage.setItem('offerEndTime', endTime.toString());
      } else {
        endTime = parseInt(storedEndTime, 10);
      }
      return endTime;
    };

    const endTime = getInitialTimeLeft();
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, hasExpired: true };
      }

      return {
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
        hasExpired: false,
      };
    };
    
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [isClient, offer]);

  if (!offer) return null;

  if (!isClient || timeLeft === null) {
    // Render nothing or a placeholder on the server and initial client render
    return null;
  }

  if (timeLeft.hasExpired) {
    return (
       <div className="rounded-lg border-2 border-dashed border-red-400 bg-red-50/50 p-3 flex items-center space-x-3 my-4">
        <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></div>
        <p className='text-sm font-medium text-red-700'>
          {offer.expiredText}
        </p>
      </div>
    );
  }

  const formattedTime = `${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`;
  const offerText = offer.activeText.replace('{timer}', formattedTime);

  return (
    <div className="rounded-lg border-2 border-dashed border-green-400 bg-green-50/50 p-3 flex items-center space-x-3 my-4">
      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse flex-shrink-0"></div>
      <p className='text-sm' dangerouslySetInnerHTML={{ __html: offerText.replace(formattedTime, `<span class="font-bold text-green-700">${formattedTime}</span>`) }}/>
    </div>
  );
}

function PurchaseBenefits() {
    const benefits = [
        { icon: Gift, text: "<strong class='text-foreground'>Regalos GRATIS</strong>" },
        { icon: Gamepad2, text: "<strong class='text-foreground'>Todos los juegos preinstalados</strong>" },
        { icon: Tv, text: "<strong class='text-foreground'>Funciona con cualquier TV</strong>" },
    ];

    return (
        <div className="space-y-3 my-6">
            {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                    <benefit.icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: benefit.text }} />
                </div>
            ))}
        </div>
    );
}


export default function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(() => {
    if (!product || !product.variants || product.variants.length === 0) {
      return { id: 'default', name: 'Default', price: 0 } as ProductVariant;
    }
    return product.variants.find(v => v.isBestSeller) || product.variants[0];
  });
  const [selectedColor, setSelectedColor] = useState(product.selectionOptions?.colors?.options?.[0]?.id || '');

  const { addToCart, setIsCartOpen } = useCart();
  const router = useRouter();

  const handleBuyNow = () => {
    const colorName = product.selectionOptions?.colors?.options?.find(o => o.id === selectedColor)?.name;
    
    let fullName = `${product.name} - ${selectedVariant.name}`;
    if (colorName) fullName += ` - ${colorName}`;

    addToCart({
      id: `${product.id}-${selectedVariant.id}-${selectedColor}`,
      name: fullName,
      price: selectedVariant.price,
      quantity: 1,
      image: product.cartImage,
      color: colorName,
    });
    setIsCartOpen(true);
  };

  const [isSticky, setIsSticky] = useState(false);
  const addToCartRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);


  useEffect(() => {
    setIsMounted(true);
    
    const mainAddToCartButton = addToCartRef.current;
    if (!mainAddToCartButton) return;

    let lastY = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const currentY = entry.boundingClientRect.y;
        const isIntersecting = entry.isIntersecting;
        const isScrollingDown = currentY < lastY;

        if (isScrollingDown && !isIntersecting) {
            setIsSticky(true);
        } else if (!isScrollingDown && isIntersecting) {
            setIsSticky(false);
        }
        
        lastY = currentY;
      },
      {
        rootMargin: '-65px 0px 0px 0px', 
        threshold: 0,
      }
    );

    observer.observe(mainAddToCartButton);
    
    return () => {
        if (mainAddToCartButton) {
          observer.unobserve(mainAddToCartButton);
        }
    };

  }, []);
  
  const handleVariantChange = (variantId: string) => {
    const newVariant = product.variants.find(v => v.id === variantId);
    if (newVariant) {
      setSelectedVariant(newVariant);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-title font-bold tracking-wide">
          {product.name}
          <span className="font-normal text-3xl md:text-4xl align-super">®</span>
        </h1>
        <div className="flex items-center space-x-3">
          {selectedVariant.originalPrice && (
            <span className="text-xl line-through text-muted-foreground">
              {selectedVariant.originalPrice.toFixed(0)}€
            </span>
          )}
          <span className="text-2xl font-bold text-accent">
            {selectedVariant.price.toFixed(0)}€
          </span>
          {selectedVariant.originalPrice && (
            <Badge
              className="border-transparent text-white"
              style={{ backgroundColor: 'black' }}
            >
              Ahorra un {Math.round(((selectedVariant.originalPrice - selectedVariant.price) / selectedVariant.originalPrice) * 100)}%
            </Badge>
          )}
        </div>
      </div>

      <CountdownTimer offer={product.countdownOffer} />

      <PurchaseBenefits />
      
      <div>
        <h3 className="text-sm font-medium mb-2">Versión:</h3>
        <RadioGroup
          defaultValue={selectedVariant.id}
          onValueChange={handleVariantChange}
          className="mt-2 grid grid-cols-2 gap-3"
        >
          {product.variants.map(variant => (
             <Label
              key={variant.id}
              htmlFor={variant.id}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-md border-2 p-3 cursor-pointer focus:outline-none",
                "data-[state=checked]:border-primary",
                {
                  'border-primary ring-2 ring-primary': selectedVariant.id === variant.id,
                  'border-muted hover:border-muted-foreground': selectedVariant.id !== variant.id,
                }
              )}
            >
              {variant.isBestSeller && (
                  <Badge className="absolute -top-3 bg-primary text-primary-foreground text-xs">
                    Más vendida
                  </Badge>
              )}
              <RadioGroupItem
                value={variant.id}
                id={variant.id}
                className="sr-only"
              />
              <span className="font-semibold">{variant.name}</span>
              <span className="text-sm text-muted-foreground">{variant.price.toFixed(0)}€</span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      {product.selectionOptions && product.selectionOptions.colors?.options?.length > 0 && (
        <div className="space-y-6">
          {/* Color Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider">{product.selectionOptions.colors.label}</h3>
            <div className="grid grid-cols-2 gap-4">
              {product.selectionOptions.colors.options.map((option) => (
                <div key={option.id} className="space-y-2">
                  <button
                    onClick={() => setSelectedColor(option.id)}
                    className={cn(
                      "w-full aspect-square relative rounded-3xl border-2 overflow-hidden transition-all",
                      selectedColor === option.id
                        ? "border-primary ring-4 ring-primary/20"
                        : "border-muted hover:border-muted-foreground"
                    )}
                  >
                    <Image
                      src={getImage(option.image)}
                      alt={option.name}
                      fill
                      className="object-contain p-4"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                  <p className={cn(
                    "text-center font-bold text-sm",
                    selectedColor === option.id ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {option.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div ref={addToCartRef} className="space-y-3">
        <Button
          size="lg"
          className="w-full h-auto py-4 text-2xl uppercase bg-black text-white hover:bg-black/90 flex-col leading-tight"
          onClick={handleBuyNow}
        >
            <span>Comprar ahora</span>
            <span className="text-xs font-normal normal-case tracking-normal">Últimas unidades en stock</span>
        </Button>
      </div>

      <div className="!mt-0 !mb-0 py-0">
        <div className="flex items-center justify-between relative max-w-sm mx-auto">
          {/* Timeline Line */}
          <div className="absolute top-[26px] left-[15%] right-[15%] h-[1px] bg-gray-200 -z-0" />
          
          {/* Step 1: Compra */}
          <div className="flex flex-col items-center text-center space-y-2 z-10">
            <div className="w-14 h-14 rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-black" strokeWidth={1.5} />
            </div>
            <div className="space-y-0">
              <p className="font-bold text-base text-black">Compra</p>
              <p className="text-sm text-gray-500">Hoy</p>
            </div>
          </div>

          {/* Step 2: Envío */}
          <div className="flex flex-col items-center text-center space-y-2 z-10">
            <div className="w-14 h-14 rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <Truck className="w-6 h-6 text-black" strokeWidth={1.5} />
            </div>
            <div className="space-y-0">
              <p className="font-bold text-base text-black">Envío</p>
              <p className="text-sm text-gray-500">
                {new Date(Date.now() + 86400000).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '')}
              </p>
            </div>
          </div>

          {/* Step 3: Llegada */}
          <div className="flex flex-col items-center text-center space-y-2 z-10">
            <div className="w-14 h-14 rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <Package className="w-6 h-6 text-black" strokeWidth={1.5} />
            </div>
            <div className="space-y-0">
              <p className="font-bold text-base text-black">Llegada</p>
              <p className="text-sm text-gray-500">
                {new Date(Date.now() + 172800000).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="!mt-0 py-2">
        <Image 
          src="/images/bizum5.webp" 
          alt="Pagos seguros con Bizum" 
          width={600} 
          height={120} 
          className="w-full h-auto"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="!mt-0">
        <ProductInfoAccordion productInfo={product.productInfoAccordion} />
      </div>

      <div className="!mt-0">
        <CustomerReviewsCarousel />
      </div>

      {/* Sticky Add to Cart Bar */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-2 sm:p-4 transition-transform duration-300 z-50 border-t',
          isSticky ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="container mx-auto flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          <div className="w-full flex items-center gap-2 sm:gap-4">
            <Image
              src={getImage(product.cartImage)}
              alt={product.name}
              width={48}
              height={48}
              className="rounded-md object-cover sm:w-16 sm:h-16"
              referrerPolicy="no-referrer"
            />
            <div className="flex-grow">
              <h3 className="font-bold text-sm sm:text-base sm:hidden">
                {product.name}
              </h3>
              <h3 className="font-bold hidden sm:block">{product.name}</h3>
              <p className="text-base sm:text-lg font-bold text-accent">
                {selectedVariant.price.toFixed(0)}€{' '}
                <span className="text-xs sm:text-sm text-muted-foreground font-normal">
                  ({selectedVariant.name})
                </span>
              </p>
            </div>
          </div>
          <Button
            size="lg"
            className="bg-black text-white hover:bg-black/90 text-base sm:text-lg uppercase w-full sm:w-auto sm:flex-shrink-0 h-11"
            onClick={handleBuyNow}
          >
              Comprar ahora
          </Button>
        </div>
      </div>
    </div>
  );
}
