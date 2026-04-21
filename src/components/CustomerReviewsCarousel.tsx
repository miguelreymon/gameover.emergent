
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
import { siteContent as defaultContent } from '@/lib/content';
import { useConfig } from '@/context/ConfigContext';
import { getImage } from '@/lib/images';

export default function CustomerReviewsCarousel() {
  const config = useConfig();
  const siteContent = config || defaultContent;
  const { title, videos: customerVideos } = siteContent.homePage.customerReviewsCarouselSection;

  const [selectedVideo, setSelectedVideo] = useState<typeof customerVideos[0] | null>(
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
    <div className="py-6">
      <h2 className="text-xl font-bold font-headline text-center mb-8">
        {title}
      </h2>
      <Carousel
        setApi={setApi}
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {customerVideos.map((video, index) => (
            <CarouselItem 
              key={video.id} 
              className="pl-2 basis-1/3"
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
                    >
                      <Card className="overflow-hidden">
                        <CardContent className="p-0 aspect-[9/16] relative flex items-center justify-center">
                          <video
                            src={getImage(video.src)}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity opacity-0 hover:opacity-100">
                            <PlayCircle className="w-16 h-16 text-white/80" />
                          </div>
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
                        src={getImage(selectedVideo?.src || "")}
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
      <div className="flex justify-center pt-4">
        <div className="flex items-center gap-2">
            {customerVideos.map((_, i) => (
                <button
                    key={i}
                    onClick={() => api?.scrollTo(i)}
                    className={cn('w-2 h-2 rounded-full', {
                    'bg-primary': i === current,
                    'bg-muted': i !== current,
                    })}
                />
            ))}
        </div>
      </div>
    </div>
  );
}
