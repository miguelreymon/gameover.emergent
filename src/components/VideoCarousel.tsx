
'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { siteContent } from '@/lib/content';

const { title, videos } = siteContent.homePage.videoCarouselSection;

export default function VideoCarousel() {
  const [selectedVideo, setSelectedVideo] = useState<(typeof videos)[0] | null>(
    null
  );
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!api) {
      return
    }

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap())
    }

    api.on("select", handleSelect)
    handleSelect()

    return () => {
      api.off("select", handleSelect)
    }
  }, [api])


  return (
    <div className="pb-6">
      <h2 className="text-3xl font-bold font-headline text-center mb-8">
        {title}
      </h2>
      <Carousel
        setApi={setApi}
        opts={{
          align: 'center',
          loop: true,
          startIndex: 1,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {videos.map((video, index) => (
            <CarouselItem 
              key={video.id} 
              className="pl-2 basis-5/6 sm:basis-1/2 md:basis-1/3"
            >
              <div className="p-1">
                <Dialog
                  open={selectedVideo?.id === video.id}
                  onOpenChange={open => {
                    if (!open) {
                      setSelectedVideo(null);
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <button
                      className="w-full relative block"
                      onClick={() => setSelectedVideo(video)}
                      disabled={!video.src}
                    >
                      <Card className="overflow-hidden">
                        <CardContent className="p-0 aspect-[9/16] relative flex items-center justify-center bg-muted">
                          {video.src ? (
                            <>
                            <video
                              src={video.src}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity opacity-0 hover:opacity-100">
                              <PlayCircle className="w-16 h-16 text-white/80" />
                            </div>
                            </>
                          ) : (
                            <div className="w-full h-full bg-secondary flex items-center justify-center">
                              <p className="text-muted-foreground">No video</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="p-0 bg-transparent border-0 w-full max-w-[320px] sm:max-w-md aspect-[9/16]">
                    <DialogTitle className="sr-only">
                      {selectedVideo?.title}
                    </DialogTitle>
                    <div className="w-full h-full">
                      <video
                        src={selectedVideo?.src}
                        controls
                        autoPlay
                        className="w-full h-full rounded-lg"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </div>
  );
}
