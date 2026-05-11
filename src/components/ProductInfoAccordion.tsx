
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { Product } from '@/lib/products';

interface ProductInfoAccordionProps {
  productInfo: Product['productInfoAccordion'];
}

export default function ProductInfoAccordion({ productInfo }: ProductInfoAccordionProps) {
  if (!productInfo) return null;
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1" className="border-b border-gray-100">
        <AccordionTrigger className="text-lg font-medium py-4 hover:no-underline text-left">
          {productInfo.shipping.title}
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 text-muted-foreground text-left pb-4">
            <h4 className='font-semibold text-foreground'>{productInfo.shipping.freeShippingTitle}</h4>
            <p>
             {productInfo.shipping.freeShippingContent}
            </p>
            <h4 className='font-semibold text-foreground'>{productInfo.shipping.trackingTitle}</h4>
            <p>
              {productInfo.shipping.trackingContent}
            </p>
            <p>{productInfo.shipping.contactInfo}</p>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-8" className="border-b border-gray-100">
        <AccordionTrigger className="text-lg font-medium py-4 hover:no-underline text-left">
          {productInfo.warranty.title}
        </AccordionTrigger>
        <AccordionContent>
        <div className="space-y-4 text-muted-foreground text-left pb-4">
          <p>{productInfo.warranty.satisfactionGuarantee}</p>
          <p>
           {productInfo.warranty.returnsPolicy}
          </p>
          </div>
        </AccordionContent>
      </AccordionItem>
      {productInfo.extra && (
        <AccordionItem value="item-extra" className="border-b border-gray-100">
          <AccordionTrigger className="text-lg font-medium py-4 hover:no-underline text-left">
            {productInfo.extra.title}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 text-muted-foreground text-left pb-4">
              <p>{productInfo.extra.content}</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
}
