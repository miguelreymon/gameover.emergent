
'use client';

import Link from 'next/link';
import { siteContent as defaultContent } from '@/lib/content';
import { useConfig } from '@/context/ConfigContext';

const WhatsAppIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path
      d="M16.75 13.96c-.25-.12-1.47-.72-1.7-.84-.23-.12-.39-.12-.56.12-.17.25-.64.84-.79 1.01-.15.17-.29.18-.54.06-.25-.12-1.06-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.15-.25-.02-.38.1-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.55-.42h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.76 2.67 4.25 3.73.59.25 1.05.4 1.41.51.59.18 1.13.15 1.56.09.48-.06 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.12-.22-.18-.47-.3zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
    />
  </svg>
);


export default function WhatsAppButton() {
  const config = useConfig();
  const siteContent = config || defaultContent;
  const phoneNumber = siteContent.footer.whatsAppNumber.replace(/\D/g, '');
  const message = "Hola, estoy en la web y tengo una pregunta sobre la Consola Gameover®";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <Link 
      href={whatsappUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-24 right-6 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg z-50 flex items-center justify-center transition-transform hover:scale-110"
      aria-label="Contactar por WhatsApp"
    >
      <WhatsAppIcon />
    </Link>
  );
}
