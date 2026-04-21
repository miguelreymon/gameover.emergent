
'use client';

import Link from 'next/link';
import { User, Menu, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { CartDrawer } from './CartDrawer';
import { useState } from 'react';
import Image from 'next/image';
import { MobileMenu } from './MobileMenu';
import { siteContent as defaultContent } from '@/lib/content';
import { useConfig } from '@/context/ConfigContext';
import { getImage } from '@/lib/images';

const defaultNavLinks = [
    { text: 'Consola Gameover®', href: '/' },
    { text: 'Comunidad', href: '/comunidad' },
    { text: 'Sobre Nosotros', href: '/sobre-nosotros' },
    { text: 'Localiza tu pedido', href: '/localizar-pedido' },
    { text: 'Contacto', href: '/contacto' },
];

export function Header() {
  const { cartItems, setIsCartOpen } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const config = useConfig();
  const siteContent = config || defaultContent;

  if (!siteContent || !siteContent.header) {
    return null;
  }

  const navLinks = Array.isArray((siteContent as any).menu) && (siteContent as any).menu.length
    ? (siteContent as any).menu
    : defaultNavLinks;

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full bg-primary"
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Abrir menú"
              onClick={() => setIsMenuOpen(true)}
              className="hover:bg-primary/90 md:hidden text-primary-foreground"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-primary-foreground">
                {navLinks.map((link: {text: string; href: string}) => (
                    <Link key={link.href} href={link.href} className="hover:opacity-80 transition-opacity">{link.text}</Link>
                ))}
            </nav>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="my-4">
              <Image
                src={getImage(siteContent.header.logo)}
                alt="Game Over Logo"
                width={90}
                height={14}
                priority
                referrerPolicy="no-referrer"
              />
            </Link>
          </div>

          <div className="flex items-center justify-end space-x-2">
            <Link href="/login" passHref>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Acceso de usuario"
                className='hidden md:inline-flex text-primary-foreground'
              >
                <User className="h-6 w-6" />
              </Button>
            </Link>
            <Button
                variant="ghost"
                size="icon"
                aria-label="Abrir carrito"
                className="relative text-primary-foreground"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
                    {totalItems}
                  </span>
                )}
              </Button>
          </div>
        </div>
      </header>
      <CartDrawer />
      <MobileMenu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} navLinks={navLinks} />
    </>
  );
}
