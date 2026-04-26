import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/CartContext';
import Script from 'next/script';
import { getContent } from '@/lib/data';
import { siteContent as defaultContent } from '@/lib/content';
import { AppLayout } from './AppLayout';
import { Metadata } from 'next';

// ISR: páginas estáticas regeneradas cada 60s. Edits en /admin se reflejan
// sin redeploy (siempre que el host soporte ISR; en Vercel sí).
// Antes era force-dynamic = SSR en cada visita = lento.
export const revalidate = 60;

import { Montserrat, Mouse_Memoirs, Poppins, Work_Sans } from 'next/font/google';

// display: 'swap' evita que el texto sea invisible mientras carga la fuente
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-montserrat',
  display: 'swap',
  preload: true,
});

const mouseMemoirs = Mouse_Memoirs({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mouse-memoirs',
  display: 'swap',
  preload: false, // decorativa, no LCP
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-poppins',
  display: 'swap',
  preload: true,
});

const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'], // quitado el 500 que no se usaba apenas
  variable: '--font-work-sans',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: 'Game Over',
  description: 'Consola Gameover®',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = (await getContent()) || defaultContent;
  const theme = config?.theme || {};

  return (
    <html lang="es" className={cn('h-full', montserrat.variable, mouseMemoirs.variable, poppins.variable, workSans.variable)}>
      <head>
        {/* Preconnect a CDN críticos para que el navegador resuelva DNS antes */}
        <link rel="preconnect" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://www.facebook.com" />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased')}>
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            ${theme.primary ? `--primary: ${theme.primary}; --ring: ${theme.primary};` : ''}
            ${theme.accent ? `--accent: ${theme.accent};` : ''}
            ${theme.background ? `--background: ${theme.background};` : ''}
            ${theme.foreground ? `--foreground: ${theme.foreground};` : ''}
          }
        `}} />

        {/* Square SDK movido a /checkout. Antes cargaba en TODAS las páginas y bloqueaba el render. */}

        {/* Facebook Pixel: lazyOnload = se carga DESPUÉS de que la página esté interactiva */}
        <Script id="facebook-pixel" strategy="lazyOnload">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '3966676673555416');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img height="1" width="1" style={{display: 'none'}}
          src="https://www.facebook.com/tr?id=3966676673555416&ev=PageView&noscript=1"
          alt=""
          />
        </noscript>
        <CartProvider>
          <AppLayout initialConfig={config}>{children}</AppLayout>
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
