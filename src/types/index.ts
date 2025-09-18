export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthTokens {
  access: {
    token: string;
    expires: string;
  };
  refresh: {
    token: string;
    expires: string;
  };
}

export interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  login: (data: { user: User; tokens: AuthTokens }) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export type ContentType = 'PRODUCT' | 'SERVICE' | 'ARTICLE';

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: ContentType;
  description?: string;
  image?: string;
  parentId?: string | null;
  parent?: Category | null;
}

export interface Variant {
  name: string;
  priceModifier: number;
}

export interface ContentItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  content?: string | null;
  price?: number | null;
  images: string; // This remains a JSON string of image URLs
  type: ContentType;
  categories: Category[];
  categoryId: string;

  // --- NEW & EXPANDED FIELDS ---
  salePrice?: number | null; // For showing discounted prices
  vendor?: string;
  sku?: string;
  availability?: string;
  attributes?: string; // For the short list of specs
  variants?: string;
  
  // For the tabbed section
  specifications?: Record<string, string>; // e.g., { "Ruling Planet": "Mars", "Weight": "2.5 gms" }
  benefits?: { icon: string, text: string }[]; // A list of benefits
  howToUse?: { step: number, instruction: string }[];
  packageContents?: string[];
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  imageUrl?: string | null;
  createdAt: string;
  user?: { // User can be optional if not always included
    name: string;
  };
  product?: Partial<ContentItem>; // Product can be optional
}

export interface CartItem extends ContentItem {
  quantity: number;
}