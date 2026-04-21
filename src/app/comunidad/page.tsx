
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Library as Book, Users, Download, Trophy, Star, LifeBuoy, Gamepad2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { siteContent as defaultContent } from '@/lib/content';
import { useConfig } from '@/context/ConfigContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { getImage } from '@/lib/images';

export default function CommunityPage() {
    const config = useConfig();
    const siteContent = config || defaultContent;
    const { hero, features, pricing } = siteContent.communityPage;
    const mainProduct = siteContent.homePage.productSection.product;

    const icons: { [key: string]: React.ElementType } = {
        Book, Users, Download, Trophy, Star, LifeBuoy, Gamepad2
    };

    const { addToCart } = useCart();
    const router = useRouter();
    const defaultVariant = mainProduct.variants[0];

    const handleBuyNow = () => {
        addToCart({
            id: `${mainProduct.id}-${defaultVariant.id}`,
            name: `${mainProduct.name} - ${defaultVariant.name}`,
            price: defaultVariant.price,
            quantity: 1,
            image: getImage(mainProduct.images[0].src),
        });
        router.push('/checkout');
    };

  return (
    <div className="bg-background">
      <div className="relative isolate overflow-hidden">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        <div className="container mx-auto px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground sm:text-6xl"
                dangerouslySetInnerHTML={{ __html: hero.title}}
            />
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              {hero.subtitle}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" className="bg-black text-white hover:bg-black/90" onClick={handleBuyNow}>
                {hero.buttonText}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold font-headline">{features.title}</h2>
            <p className="text-muted-foreground mt-2">
                {features.subtitle}
            </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.items.map((feature) => {
            const Icon = icons[feature.icon];
            return (
                <Card key={feature.title} className="text-center">
                <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    {Icon && <Icon className="w-8 h-8 text-primary" />}
                    </div>
                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
                </Card>
            )
          })}
        </div>
      </div>

      <div className="my-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold font-headline sm:text-4xl">
              {pricing.title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              {pricing.subtitle}
            </p>
          </div>
          <div className="mt-12 flex justify-center">
            <Card className="max-w-md w-full shadow-lg">
              <CardContent className="p-8">
                <p className="text-sm font-semibold uppercase text-muted-foreground">
                  {pricing.card.planName}
                </p>
                <p className="mt-6 flex items-baseline gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-foreground">
                    {pricing.card.price}
                  </span>
                  <span className="text-lg font-semibold text-muted-foreground">{pricing.card.period}</span>
                </p>
                <p className="mt-3 text-sm text-green-600 font-bold">{pricing.card.offer}</p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                    {pricing.card.features.map(feature => (
                        <li key={feature} className="flex gap-x-3">
                            <Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                            {feature}
                        </li>
                    ))}
                </ul>
                <Button className="mt-8 w-full" disabled>{pricing.card.buttonText}</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
