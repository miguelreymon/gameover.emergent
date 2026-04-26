
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { siteContent } from '@/lib/content';
import Image from 'next/image';

export function Faq({ data }: { data?: any }) {
  const faqs = data?.faqs || [];
  return (
    <div className="py-12 bg-black text-white" id="faq">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
            <Image
                src="/images/mario.webp"
                alt="Preguntas Frecuentes"
                width={300}
                height={290}
                className="inline-block"
                loading="lazy"
                referrerPolicy="no-referrer"
            />
        </div>
        <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
          {faqs.map((item, index) => (
            <AccordionItem key={index} value={`item-${index + 1}`} className="border-gray-700">
              <AccordionTrigger className="text-lg font-medium text-left hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent>
                <div
                  className="space-y-4 text-gray-300 whitespace-pre-line"
                  dangerouslySetInnerHTML={{
                    __html: item.answer.replace(
                      /•/g,
                      '<br />•'
                    ),
                  }}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

    