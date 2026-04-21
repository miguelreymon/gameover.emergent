export interface Review {
  id: string;
  name: string;
  date: string;
  rating: number;
  text: string;
  isVerified: boolean;
  image?: string;
}
