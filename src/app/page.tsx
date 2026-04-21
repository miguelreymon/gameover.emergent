
'use client';

import { useState, useEffect } from 'react';
import ProductGallery from '@/components/ProductGallery';
import ProductDetails from '@/components/ProductDetails';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Reviews from '@/components/Reviews';
import CustomerReviewsCarousel from '@/components/CustomerReviewsCarousel';
import { Faq } from '@/components/Faq';
import Link from 'next/link';
import GameSearchSection from '@/components/GameSearchSection';
import { useConfig } from '@/context/ConfigContext';
import { siteContent as defaultContent } from '@/lib/content';
import { getImage } from '@/lib/images';

export default function Home() {
  const config = useConfig();
  const siteContent = config || defaultContent;

  if (!siteContent || !siteContent.homePage) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  const { 
    productSection, 
    featureSection1,
    featureSection2,
    gallerySection,
    gallerySection2,
    customerReviewsCarouselSection,
    reviewsSection,
    faqSection,
    heroImage
  } = siteContent.homePage;

  if (!productSection || !productSection.product) {
    return <div className="flex items-center justify-center min-h-screen">Error al cargar el producto.</div>;
  }

  const mainProduct = productSection.product;

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-8">
          {heroImage && (
            <Image
              src={getImage(heroImage)}
              alt="Emuladores compatibles"
              width={600}
              height={120}
              className="mx-auto"
              referrerPolicy="no-referrer"
            />
          )}
        </div>
        <div className="py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
            <ProductGallery images={mainProduct.images} />
            <ProductDetails product={mainProduct} />
          </div>
        </div>
      </div>

      <FeatureSection1 data={featureSection1} />
      <FeatureSection1 data={featureSection2} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Reviews />
      </div>
      <Faq data={faqSection} />
    </>
  );
}

function FeatureSection1({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-headline">
              {data.title}
            </h2>
            {data.paragraphs?.map((p: string, i: number) => (
                <p key={i} className="text-muted-foreground">{p}</p>
            ))}
            {data.text && <p className="text-muted-foreground">{data.text}</p>}
            <ul className="space-y-2 list-disc list-inside text-muted-foreground">
              {data.listItems?.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-square">
            <Image
                src={getImage(data.imageSrc)}
                alt="Consola retro y mandos"
                fill
                className="rounded-lg object-contain"
                referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function GallerySection({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="py-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.images?.map((image: any, i: number) => (
            <div key={i} className="aspect-[4/3] w-full relative">
                <Image
                src={getImage(image.src)}
                alt={image.alt}
                fill
                className="rounded-lg object-cover"
                referrerPolicy="no-referrer"
                />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

    

    
