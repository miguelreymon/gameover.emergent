'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { submitReviewAction } from '@/app/actions';
import { Loader2, Star } from 'lucide-react';
import type { Review } from '@/lib/reviews';

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio.'),
  orderId: z.string().min(1, 'El número de pedido es obligatorio.'),
  rating: z.number().min(1, 'La valoración es obligatoria.'),
  text: z.string().min(1, 'La reseña es obligatoria.'),
  photo: z.instanceof(File).optional(),
});

interface ReviewFormProps {
  onSubmitSuccess: (review: Review) => void;
  onClose: () => void;
}

export default function ReviewForm({
  onSubmitSuccess,
  onClose,
}: ReviewFormProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      orderId: '',
      rating: 0,
      text: '',
    },
  });

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsProcessing(true);

    let photoDataUri: string | undefined;
    if (values.photo) {
      photoDataUri = await toBase64(values.photo);
    }

    const result = await submitReviewAction({
      name: values.name,
      orderId: values.orderId,
      rating: values.rating,
      text: values.text,
      photoDataUri: photoDataUri,
    });
    
    setIsProcessing(false);

    if (result.success) {
      toast({
        title: '¡Reseña enviada!',
        description: 'Gracias por tus comentarios.',
      });
      onSubmitSuccess({
        id: Math.random().toString(),
        name: values.name,
        date: new Date().toLocaleDateString('es-ES'),
        rating: values.rating,
        text: values.text,
        isVerified: result.isVerified,
        image: photoDataUri,
      });
      onClose();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error al enviar la reseña',
        description:
          'No se pudo enviar tu reseña. Por favor, inténtalo de nuevo.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="orderId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de pedido</FormLabel>
              <FormControl>
                <Input placeholder="Lo encontrarás en tu email de confirmación" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valoración</FormLabel>
              <FormControl>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, index) => {
                    const currentRating = index + 1;
                    return (
                      <button
                        key={currentRating}
                        type="button"
                        className="focus:outline-none"
                        onMouseEnter={() => setHoverRating(currentRating)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => {
                          setRating(currentRating);
                          field.onChange(currentRating);
                        }}
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            currentRating <= (hoverRating || rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reseña</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="photo"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel>Añadir foto (opcional)</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={e => onChange(e.target.files?.[0])}
                  {...rest}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isProcessing}>
          {isProcessing ? (
            <Loader2 className="animate-spin" />
          ) : (
            'Enviar reseña'
          )}
        </Button>
      </form>
    </Form>
  );
}
