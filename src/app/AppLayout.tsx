'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import ThemeInjector from '@/components/ThemeInjector';
import { ConfigProvider } from '@/context/ConfigContext';
import { siteContent as defaultContent } from '@/lib/content';

const WhatsAppButton = dynamic(() => import('@/components/WhatsAppButton'), { ssr: false });

export function AppLayout({ children, initialConfig }: { children: React.ReactNode; initialConfig: any }) {
  const pathname = usePathname();
  const isCheckoutPage = pathname === '/checkout';
  const isAdminPage = !!pathname && pathname.startsWith('/admin');

  const config = initialConfig || defaultContent;
  const announcementBar = config?.header?.announcementBar || '🤍​ OFERTA BLACKFRIDAY SOLO HOY –50 % DE DESCUENTO Y ENVIO GRATIS 🤍';
  const whatsAppNumber = config?.footer?.whatsAppNumber || '622431478';
  const cleanNumber = whatsAppNumber.replace(/\D/g, '');
  const theme = config?.theme || null;
  const announcementBg = theme?.announcementBg || 'black';

  if (isAdminPage) {
    return <ConfigProvider initialConfig={initialConfig}>{children}</ConfigProvider>;
  }

  return (
    <ConfigProvider initialConfig={initialConfig}>
      <ThemeInjector theme={theme} />
      <div className="flex flex-col min-h-screen">
        <div
          className="py-2 px-4 text-primary-foreground font-button font-bold text-sm overflow-hidden whitespace-nowrap"
          style={{ backgroundColor: announcementBg }}
        >
          <p className="animate-marquee inline-block">{announcementBar}</p>
        </div>
        <Header />
        <main className="flex-grow">{children}</main>
        {!isCheckoutPage && <Footer />}
        <WhatsAppButton phone={cleanNumber} />
      </div>
    </ConfigProvider>
  );
}
