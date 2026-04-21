
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/products';
import { siteContent as defaultContent } from '@/lib/content';
import { useConfig } from '@/context/ConfigContext';
import { getImage } from '@/lib/images';

interface ProductGalleryProps {
  images: Product['images'];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const config = useConfig();
  const siteContent = config || defaultContent;

  if (!images || images.length === 0) {
    return <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center">No hay imágenes disponibles</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <div className="aspect-square w-full overflow-hidden rounded-lg shadow-lg">
          <Image
            src={getImage(images[selectedImage].src)}
            alt={images[selectedImage].alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            data-ai-hint={images[selectedImage].hint}
            priority
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute -top-3 left-2 z-10 flex items-center space-x-2 p-2 bg-secondary rounded-lg shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 3 2" className="rounded-sm">
            <rect width="3" height="2" fill="#c60b1e"/>
            <rect width="3" height="1" y=".5" fill="#ffc400"/>
            </svg>
            <p className="text-xs sm:text-sm font-medium text-secondary-foreground">
                {siteContent.homePage.productSection.product.distributorBadge}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setSelectedImage(index)}
            className={cn(
              'aspect-square relative w-full overflow-hidden rounded-md transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              selectedImage === index ? 'opacity-100' : 'opacity-60 hover:opacity-100'
            )}
          >
            <Image
              src={getImage(image.src)}
              alt={image.alt}
              fill
              className="object-cover"
              sizes="20vw"
              data-ai-hint={image.hint}
              referrerPolicy="no-referrer"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

    