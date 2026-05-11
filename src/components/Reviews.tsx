
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CheckCircle, Star, ChevronDown } from 'lucide-react';
import ReviewForm from './ReviewForm';
import type { Review } from '@/lib/reviews';
import { siteContent as defaultContent } from '@/lib/content';
import { useConfig } from '@/context/ConfigContext';
import { getImage } from '@/lib/images';


const StarIcon = ({ filled }: { filled: boolean }) => (
  <Star
    className={`w-5 h-5 ${
      filled ? 'text-yellow-400 fill-current' : 'text-gray-300'
    }`}
  />
);

export default function Reviews() {
  const config = useConfig();
  const siteContent = config || defaultContent;
  const reviewsSection = siteContent.homePage.reviewsSection as { enabled?: boolean; reviews: Review[]; title?: string };

  const initialReviews: Review[] = reviewsSection?.reviews || [];

  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Hide entirely if explicitly disabled from admin (after hooks per React rules).
  if (reviewsSection?.enabled === false) return null;

  const handleReviewSubmit = (newReview: Review) => {
    setReviews([newReview, ...reviews]);
  };

  const group1 = reviews.slice(0, 13);
  const restOfReviews = reviews.slice(13);

  const ReviewCard = ({ review, showImage = true }: { review: Review; showImage?: boolean }) => (
    <div key={review.id} className={`p-3 sm:p-6 space-y-3 sm:space-y-4 border rounded-xl bg-card/50 shadow-sm flex flex-col h-full`}>
      {showImage && review.image && (
        <div className="relative w-full aspect-[4/3] sm:aspect-video mb-2 sm:mb-4">
          <Image
            src={getImage(review.image)}
            alt={`Review by ${review.name}`}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className="rounded-lg object-cover"
            data-ai-hint="customer photo"
            loading="lazy"
            quality={70}
            referrerPolicy="no-referrer"
          />
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <h3 className="font-bold text-sm sm:text-lg truncate">{review.name}</h3>
            {review.isVerified && (
              <span className="flex items-center text-[10px] sm:text-xs text-muted-foreground gap-1 bg-green-50 text-green-700 px-1.5 sm:px-2 py-0.5 rounded-full w-fit">
                <CheckCircle className="w-2.5 h-2.5 sm:w-3 h-3" />
                Verificado
              </span>
            )}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">{review.date}</p>
        </div>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <StarIcon key={i} filled={i < review.rating} />
          ))}
        </div>
      </div>
      {review.text && <p className="text-xs sm:text-base leading-relaxed italic flex-grow line-clamp-4 sm:line-clamp-none">&quot;{review.text}&quot;</p>}
    </div>
  );

  return (
    <div className="py-12 max-w-7xl mx-auto px-2 sm:px-4">
      <h2 className="text-2xl sm:text-3xl font-bold font-headline text-center mb-8">
        {siteContent.homePage.reviewsSection.title}
      </h2>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 px-2">
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} filled={true} />
            ))}
          </div>
          <span className="font-bold text-sm sm:text-base">{reviews.length} Reseñas</span>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="sm:size-default">Escribe una reseña</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Escribe tu reseña</DialogTitle>
              </DialogHeader>
              <ReviewForm
                onSubmitSuccess={handleReviewSubmit}
                onClose={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="space-y-8 sm:space-y-12">
        {/* First 13 reviews in 2 columns with images */}
        <div className="grid grid-cols-2 gap-3 sm:gap-8">
          {group1.map((review) => (
            <ReviewCard key={review.id} review={review} showImage={true} />
          ))}
        </div>

        {/* Remaining reviews hidden behind button */}
        {showAll && restOfReviews.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 pt-8 border-t animate-in fade-in slide-in-from-bottom-4 duration-500">
            {restOfReviews.map((review) => (
              <ReviewCard key={review.id} review={review} showImage={false} />
            ))}
          </div>
        )}

        {!showAll && restOfReviews.length > 0 && (
          <div className="flex justify-center pt-12">
            <Button 
              onClick={() => setShowAll(true)}
              variant="outline"
              size="lg"
              className="group rounded-full px-8"
            >
              Ver más valoraciones
              <ChevronDown className="ml-2 h-4 w-4 group-hover:translate-y-1 transition-transform" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
