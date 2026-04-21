import { notFound } from 'next/navigation';
import Image from 'next/image';
import ProductGallery from '@/components/ProductGallery';
import ProductDetails from '@/components/ProductDetails';
import { Faq } from '@/components/Faq';
import Reviews from '@/components/Reviews';
import { getContent } from '@/lib/data';
import { siteContent as defaultContent } from '@/lib/content';
import { getImage } from '@/lib/images';

export const dynamic = 'force-dynamic';

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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Reviews />
      </div>
      {faqSection && <Faq data={faqSection} />}
    </>
  );
}
