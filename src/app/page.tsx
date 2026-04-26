'use client';

import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useConfig } from '@/context/ConfigContext';
import { siteContent as defaultContent } from '@/lib/content';
import { getImage } from '@/lib/images';

// Lazy: estos bloques están bajo el fold y no son críticos para el LCP
const Reviews = dynamic(() => import('@/components/Reviews'), {
  ssr: false,
  loading: () => <div className="py-12 min-h-[200px]" />,
});
const Faq = dynamic(() => import('@/components/Faq').then(m => ({ default: m.Faq })), {
  ssr: false,
  loading: () => <div className="py-12 min-h-[200px]" />,
});

export default function Home() {
  const config = useConfig();
  const siteContent = config || defaultContent;

  if (!siteContent) {
    return (
      <div className="flex items-center justify-center min-h-screen">Cargando...</div>
    );
  }

  const products: any[] = siteContent.products || [];
  const hero = siteContent.heroBanner;
  const faqSection = siteContent.homePage?.faqSection;

  return (
    <>
      {/* Hero banner: imagen LCP, priority + fetchPriority high */}
      {hero?.enabled !== false && hero?.image && (
        <section className="relative w-full overflow-hidden">
          <div className="relative h-[40vh] min-h-[280px] md:h-[55vh] md:min-h-[420px] w-full">
            <Image
              src={getImage(hero.image)}
              alt={hero.title || 'Hero'}
              fill
              priority
              fetchPriority="high"
              className="object-cover"
              referrerPolicy="no-referrer"
              sizes="100vw"
            />
            {(hero.title || hero.subtitle) && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="text-center text-white px-6 max-w-3xl">
                  {hero.title && (
                    <h1 className="text-3xl md:text-5xl font-bold font-headline mb-3 drop-shadow">
                      {hero.title}
                    </h1>
                  )}
                  {hero.subtitle && (
                    <p className="text-base md:text-xl drop-shadow">{hero.subtitle}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Products grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-10">
          Nuestros Productos
        </h2>
        {products.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No hay productos publicados todavía.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {products.map((p, idx) => {
              const bestVariant =
                (p.variants || []).find((v: any) => v.isBestSeller) || p.variants?.[0];
              const price = bestVariant?.price;
              const originalPrice = bestVariant?.originalPrice;
              const thumb =
                p.cartImage || p.images?.[0]?.src || '/images/aa.png';
              return (
                <Link
                  key={p.slug || p.id}
                  href={`/producto/${p.slug}`}
                  className="group bg-white rounded-xl overflow-hidden border hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                  data-testid={`product-card-${p.slug}`}
                  prefetch={idx < 2 /* prefetch las 2 primeras tarjetas (las más vistas) */}
                >
                  <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    <Image
                      src={getImage(thumb)}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      // Solo la 1a tarjeta se carga en alta prioridad (es above the fold en mobile)
                      {...(idx === 0 ? { priority: true } : { loading: 'lazy' as const })}
                    />
                  </div>
                  <div className="p-5 space-y-2">
                    <h3 className="font-bold text-lg leading-tight">{p.name}</h3>
                    {p.shortDescription && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {p.shortDescription}
                      </p>
                    )}
                    {price != null && (
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-xl font-bold text-accent">
                          {price}€
                        </span>
                        {originalPrice && originalPrice > price && (
                          <span className="text-sm text-muted-foreground line-through">
                            {originalPrice}€
                          </span>
                        )}
                      </div>
                    )}
                    <span className="inline-block mt-2 text-sm font-semibold text-primary group-hover:underline">
                      Ver producto →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Reviews />
      </div>
      {faqSection && <Faq data={faqSection} />}
    </>
  );
}
