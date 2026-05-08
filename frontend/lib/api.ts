'use client';

import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  },
);

// API Endpoints
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

export const productsAPI = {
  getAll: (page = 1, limit = 10, categoryId?: string) =>
    api.get('/products', { params: { page, limit, categoryId } }),
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
  getAll: (page = 1, limit = 10) => api.get('/orders', { params: { page, limit } }),
  getMy: () => api.get('/orders/my'),
  getFarmerOrders: () => api.get('/orders/farmer/incoming'),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: unknown) => api.post('/orders/checkout', data),
  updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id: string) => api.get(`/categories/${id}`),
};

export const reviewsAPI = {
  create: (productId: string, data: any) =>
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
