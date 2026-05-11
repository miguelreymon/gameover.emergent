
'use client';

import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from './ui/button';
import {
  X,
} from 'lucide-react';
import { Separator } from './ui/separator';

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  navLinks: { href: string; text: string }[];
}

export function MobileMenu({ isOpen, setIsOpen, navLinks }: MobileMenuProps) {
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="left"
        className="flex w-full flex-col pr-0 sm:max-w-xs p-6"
      >
        <SheetHeader className="flex flex-row justify-between items-center px-0">
          <SheetTitle className="text-2xl font-bold font-headline">Menu</SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-6 w-6" />
              <span className="sr-only">Cerrar</span>
            </Button>
          </SheetClose>
        </SheetHeader>
        <Separator />
        <div className="flex-1 flex flex-col justify-between">
          <nav className="flex flex-col space-y-2 text-lg font-medium mt-4">
            {navLinks.map(link => (
                 <Link
                    key={link.href}
                    href={link.href}
                    className="p-2 rounded-md hover:bg-secondary"
                    onClick={() => setIsOpen(false)}
                >
                    {link.text}
                </Link>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
