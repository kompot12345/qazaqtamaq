'use client';

import axios, { AxiosError } from 'axios';
import type { RegisterDto, LoginDto, CreateOrderDto, CreateReviewDto } from '@/lib/dto';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Let the component handle the redirect — avoid full-page reload
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  register: (data: RegisterDto) => api.post('/auth/register', data),
  login: (data: LoginDto) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

export const productsAPI = {
  getAll: (page = 1, limit = 10, categoryId?: string, search?: string) =>
    api.get('/products', { params: { page, limit, ...(categoryId && { categoryId }), ...(search && { search }) } }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: unknown) => api.post('/products', data),
  update: (id: string, data: unknown) => api.patch(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  search: (query: string) => api.get('/products', { params: { search: query } }),
  getFarmerProducts: () => api.get('/products/farmer/me'),
  syncInventory: (id: string, retailStock: number, exportStock: number) =>
    api.patch(`/products/${id}/inventory`, { retailStock, exportStock }),
};

export const ordersAPI = {
  getMy: () => api.get('/orders/my'),
  getFarmerOrders: () => api.get('/orders/farmer/incoming'),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: CreateOrderDto) => api.post('/orders/checkout', data),
  updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id: string) => api.get(`/categories/${id}`),
};

export const reviewsAPI = {
  create: (productId: string, data: CreateReviewDto) =>
    api.post(`/products/${productId}/reviews`, data),
  getByProduct: (productId: string) =>
    api.get(`/products/${productId}/reviews`),
};

export const gamificationAPI = {
  claim: (score: number, duration: number) =>
    api.post('/gamification/claim', { score, duration }),
  getLeaderboard: () => api.get('/gamification/leaderboard'),
};

export const tattibekeAPI = {
  chat: (message: string) => api.post('/chat/tattibek', { message }),
};

export const analyticsAPI = {
  farmerSales: () => api.get('/analytics/farmer/sales'),
  farmerDeliveries: () => api.get('/analytics/farmer/deliveries'),
};

export const camerasAPI = {
  getAll: () => api.get('/cameras'),
  create: (data: { name: string; streamUrl: string; location?: string }) => api.post('/cameras', data),
  update: (id: string, data: { name?: string; streamUrl?: string; location?: string; isActive?: boolean }) =>
    api.patch(`/cameras/${id}`, data),
  delete: (id: string) => api.delete(`/cameras/${id}`),
};
