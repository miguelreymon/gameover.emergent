
'use client';

import Link from 'next/link';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import { siteContent as defaultContent, footerInfoLinks } from '@/lib/content';
import { useConfig } from '@/context/ConfigContext';
import Image from 'next/image';
import { getImage } from '@/lib/images';

const icons: { [key: string]: React.ElementType } = {
    Facebook, Instagram, Youtube
};

export function Footer() {
  const config = useConfig();
  const siteContent = config || defaultContent;
  
  if (!siteContent || !siteContent.footer || !siteContent.header) {
    return null;
  }

  const { brandSlogan, subscriptionTitle, subscriptionSlogan, policyLinks, socialLinks } = siteContent.footer;
  
  return (
    <footer className="bg-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-primary-foreground">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="inline-block">
                <Image 
                    src={getImage(siteContent.header.logo)}
                    alt="Game Over Logo"
                    width={120}
                    height={18}
                    referrerPolicy="no-referrer"
                />
            </Link>
            <p className="text-sm text-current/80">
              {brandSlogan}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold font-headline">Información</h3>
            <ul className="space-y-2 text-sm">
              {footerInfoLinks.map(link => (
                <li key={link.text}>
                  <Link href={link.href} className="hover:underline text-current/80 hover:text-current">
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold font-headline">Políticas</h3>
            <ul className="space-y-2 text-sm">
              {policyLinks.map(link => (
                <li key={link.text}>
                  <Link href={link.href} className="hover:underline text-current/80 hover:text-current">
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold font-headline">{subscriptionTitle}</h3>
            <p className="text-sm text-current/80">
              {subscriptionSlogan}
            </p>
            <div className="flex flex-col w-full max-w-sm space-y-2">
              <Input
                type="email"
                placeholder="Tu correo electrónico"
                className="bg-white/50 border-gray-400 placeholder:text-gray-600 text-gray-800"
              />
              <Button type="submit" variant="secondary">Suscribirse</Button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-primary-foreground/20 flex flex-col md:flex-row justify-between items-center text-sm text-current/80">
          <p>&copy; 2025 Consolas Gameover. Todos los derechos reservados.</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            {socialLinks.map(link => {
                const Icon = icons[link.icon];
                if (!Icon) return null;
                return (
                    <Link key={link.name} href={link.href} aria-label={link.name}>
                        <Icon className="h-5 w-5 hover:opacity-75" />
                    </Link>
                )
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
