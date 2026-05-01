'use client';

import Image from 'next/image';
import { getImage } from '@/lib/images';

type FeatureSection = {
  title?: string;
  paragraphs?: string[];
  listItems?: string[];
  imageSrc?: string;
};

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?.*)?$/i;
const GIF_EXT = /\.gif(\?.*)?$/i;

function isVideo(src: string | undefined) {
  if (!src) return false;
  return VIDEO_EXT.test(src);
}

function isGif(src: string | undefined) {
  if (!src) return false;
  return GIF_EXT.test(src);
}

function FeatureMedia({ src, alt, priority }: { src: string; alt: string; priority?: boolean }) {
  if (isVideo(src)) {
    return (
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        preload={priority ? 'auto' : 'metadata'}
        className="w-full h-full object-cover rounded-2xl shadow-md"
      />
    );
  }
  const gif = isGif(src);
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 50vw"
      quality={75}
      className="object-cover rounded-2xl shadow-md"
      loading={priority ? 'eager' : 'lazy'}
      priority={!!priority}
      referrerPolicy="no-referrer"
      unoptimized={gif}
    />
  );
}

function Section({ data, reverse, priority }: { data: FeatureSection; reverse?: boolean; priority?: boolean }) {
  if (!data || (!data.title && !(data.paragraphs?.length))) return null;

  const src = getImage(data.imageSrc || '');

  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center ${
            reverse ? 'md:[&>*:first-child]:order-2' : ''
          }`}
        >
          {/* Texto */}
          <div className="space-y-5">
            {data.title && (
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-headline font-bold leading-tight">
                {data.title}
              </h2>
            )}
            {(data.paragraphs || []).map((p, i) => (
              <p key={i} className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {p}
              </p>
            ))}
            {data.listItems && data.listItems.length > 0 && (
              <ul className="space-y-2 pt-2">
                {data.listItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-base">
                    <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Imagen / Vídeo */}
          {src && (
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-100">
              <FeatureMedia src={src} alt={data.title || 'Imagen destacada'} priority={priority} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function ProductFeatureSections({
  featureSection1,
  featureSection2,
}: {
  featureSection1?: FeatureSection;
  featureSection2?: FeatureSection;
}) {
  if (!featureSection1 && !featureSection2) return null;

  return (
    <>
      {featureSection1 && <Section data={featureSection1} />}
      {featureSection2 && <Section data={featureSection2} reverse />}
    </>
  );
}
