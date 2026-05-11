
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { gamesList } from '@/lib/games-list';
import { Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { siteContent as defaultContent } from '@/lib/content';
import { useConfig } from '@/context/ConfigContext';
import { getImage } from '@/lib/images';

export default function GameSearchSection() {
  const config = useConfig();
  const siteContent = config || defaultContent;
  const { imageSrc } = siteContent.homePage.gameSearchSection;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<{
    query: string;
    foundGames: string[];
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    
    setTimeout(() => {
      const searchTerms = searchQuery.trim().toLowerCase().split(' ').filter(term => term.length > 0);
      const gameListString = gamesList.join('||').toLowerCase();

      const allTermsFound = searchTerms.every(term => gameListString.includes(term));
      
      let foundGames: string[] = [];
      if (allTermsFound) {
        foundGames = gamesList.filter(game => {
          const lowercasedGame = game.toLowerCase();
          return searchTerms.every(term => lowercasedGame.includes(term));
        });
      }

      setSearchResult({
        query: searchQuery,
        foundGames: foundGames,
      });

      setIsDialogOpen(true);
      setIsLoading(false);
    }, 500);
  };

  return (
    <>
      <div className="bg-black text-white py-12 md:py-20 relative overflow-hidden my-12">
        <div className="container mx-auto px-4 z-10 relative">
            <div className="absolute -top-10 md:-top-8 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] md:h-[600px] z-0">
                <Image
                    src={getImage(imageSrc)}
                    alt="Big Smoke from GTA San Andreas"
                    fill
                    className="object-contain object-top"
                    data-ai-hint="gta character"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                />
            </div>

            <div className="pt-48 md:pt-72 max-w-2xl mx-auto">
                 <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl md:text-4xl font-bold font-headline text-white">
                        Buscador de Juegos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="flex items-center gap-2">
                            <Input
                                placeholder="Escribe el nombre de un juego..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="bg-white/90 border-gray-400 placeholder:text-gray-500 text-gray-800"
                            />
                            <Button type="submit" size="icon" aria-label="Buscar" variant="secondary" disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Resultado de la Búsqueda</DialogTitle>
          </DialogHeader>
          {searchResult && (
            <div className="flex-grow flex flex-col min-h-0">
              {searchResult.foundGames.length > 0 ? (
                <div className="text-center py-4 space-y-4 flex-grow flex flex-col min-h-0">
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
                    <p className="text-lg">
                      ¡Buenas noticias! Se encontraron{' '}
                      <strong>{searchResult.foundGames.length}</strong>{' '}
                      juegos que incluyen &quot;<span className="font-bold">{searchResult.query}</span>&quot;.
                    </p>
                  </div>
                  <ScrollArea className="flex-grow border rounded-md p-2 text-left overflow-y-auto">
                    <ul className="space-y-1">
                      {searchResult.foundGames.map((game, index) => (
                        <li key={index} className="text-sm p-1 bg-secondary rounded">
                          {game}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                  <p className="text-lg">
                    Lo sentimos, no se encontraron juegos que incluyan &quot;<span className="font-bold">{searchResult.query}</span>&quot;.
                  </p>
                   <DialogDescription className="mt-4 text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                    El sistema está en fase de pruebas y podría fallar al buscar algún juego.
                  </DialogDescription>
                  <DialogDescription className="mt-2 text-sm">
                    Recuerda que puedes añadir juegos por tu cuenta fácilmente.
                  </DialogDescription>
                </div>
              )}
            </div>
          )}
          <DialogClose asChild>
            <Button
              variant="outline"
              className="w-full mt-4"
            >
              Cerrar
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}

    