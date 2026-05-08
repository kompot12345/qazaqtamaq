import type { Role, OrderType } from '@/types';

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  role: Role;
  phone?: string;
  city?: string;
  address?: string;
  binIin?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateOrderItemDto {
  productId: string;
  quantity: number;
  price: number;
}

export interface CreateOrderDto {
  type: OrderType;
  totalAmount: number;
  deliveryAddress: string;
  deliveryCity: string;
  phone: string;
  items: CreateOrderItemDto[];
}

export interface CreateReviewDto {
  rating: number;
  comment?: string;
}
