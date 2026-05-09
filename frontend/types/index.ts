export type Role = 'FARMER' | 'B2B_BUYER' | 'B2C_BUYER' | 'ADMIN';
export type OrderType = 'RETAIL' | 'EXPORT';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  city?: string;
  address?: string;
  binIin?: string;
  isVerified?: boolean;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Farm {
  id: string;
  name: string;
  location: string;
  city?: string;
  description?: string;
  rating?: number;
  isVerified?: boolean;
}

export interface ProductFarmer {
  id: string;
  name: string;
  email?: string;
  city?: string;
  address?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  retailPrice: number;
  wholesalePrice: number;
  exportPrice: number;
  retailStock: number;
  exportStock: number;
  moq?: number;
  fatContent?: string;
  feedingType?: string;
  expirationDate?: string;
  isAvailableRetail: boolean;
  isAvailableExport: boolean;
  isVerified?: boolean;
  discountActive?: boolean;
  discountPercent?: number;
  currentPrice?: number;
  daysUntilExpiry?: number;
  price?: number;
  category?: Category;
  farm?: Farm;
  farmer?: ProductFarmer;
  reviews?: Review[];
  averageRating?: string | null;
  createdAt?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  isVerifiedPurchase?: boolean;
  createdAt: string;
  user?: { name: string };
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  retailStock: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product & {
    farmer?: { id: string; name: string; city?: string; address?: string };
  };
}

export interface Order {
  id: string;
  type: OrderType;
  status: OrderStatus;
  totalAmount: number;
  deliveryAddress?: string;
  deliveryCity?: string;
  phone?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
