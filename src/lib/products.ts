

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  isBestSeller?: boolean;
}

export interface Product {
  id: string;
  name: string;
  cartImage: string;
  variants: ProductVariant[];
  images: { id: string; src: string; alt: string; hint: string }[];
  whatsInTheBox: string[];
  productInfoAccordion: {
    community: {
      title: string;
      content: string;
      features: string[];
    },
    shipping: {
      title: string;
      freeShippingTitle: string;
      freeShippingContent: string;
      trackingTitle: string;
      trackingContent: string;
      contactInfo: string;
    },
    warranty: {
      title: string;
      satisfactionGuarantee: string;
      returnsPolicy: string;
    },
    extra?: {
      title: string;
      content: string;
    }
  },
  distributorBadge: string;
  countdownOffer: {
    activeText: string;
    expiredText: string;
  };
  selectionOptions?: {
    colors: {
      label: string;
      options: { id: string; name: string; image: string }[];
    };
  };
  paymentGatewaysImage: string;
}
