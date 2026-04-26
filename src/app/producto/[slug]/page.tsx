import { notFound } from 'next/navigation';
import Image from 'next/image';
import ProductGallery from '@/components/ProductGallery';
import ProductDetails from '@/components/ProductDetails';
import ProductFeatureSections from '@/components/ProductFeatureSections';
import Reviews from '@/components/Reviews';
import { Faq } from '@/components/Faq';
import { getContent } from '@/lib/data';
import { siteContent as defaultContent } from '@/lib/content';
import { getImage } from '@/lib/images';

export const revalidate = 60;

export async function generateStaticParams() {
  const content = (await getContent()) || defaultContent;
  const products: any[] = content?.products || [];
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = (await getContent()) || defaultContent;
  const products: any[] = content?.products || [];
  const product = products.find((p) => p.slug === slug);

  if (!product) notFound();

  const heroImage = content?.homePage?.heroImage;
  const faqSection = content?.homePage?.faqSection;

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {heroImage && (
          <div className="pt-8">
            <Image
              src={getImage(heroImage)}
              alt="Emuladores compatibles"
              width={600}
              height={120}
              className="mx-auto"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <div className="py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
            <ProductGallery images={product.images || []} />
            <ProductDetails product={product} />
          </div>
        </div>
      </div>

      <ProductFeatureSections
        featureSection1={product.featureSection1}
        featureSection2={product.featureSection2}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Reviews />
      </div>
      {faqSection && <Faq data={faqSection} />}
    </>
  );
}
