'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

/**
 * Carga el Facebook Pixel SOLO tras la primera interacción del usuario
 * (scroll, click, keydown, touch) o tras 5 segundos de inactividad.
 *
 * Esto reduce el TBT (Total Blocking Time) en móvil de forma drástica
 * porque el pixel ya no compite con el render inicial.
 */
export function FacebookPixel({ pixelId }: { pixelId: string }) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) return;

    const events = ['scroll', 'mousemove', 'touchstart', 'keydown', 'click'];
    const trigger = () => setShouldLoad(true);

    events.forEach((ev) =>
      window.addEventListener(ev, trigger, { once: true, passive: true })
    );

    // fallback: si el usuario no interactúa en 5s, lo cargamos igual
    // (los pixels deben dispararse aunque sea bounce, para tracking)
    const timeout = window.setTimeout(trigger, 5000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, trigger));
      window.clearTimeout(timeout);
    };
  }, [shouldLoad]);

  if (!shouldLoad) return null;

  return (
    <Script id="facebook-pixel" strategy="afterInteractive">
      {`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
      `}
    </Script>
  );
}
