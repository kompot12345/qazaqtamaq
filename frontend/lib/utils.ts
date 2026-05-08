import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-KZ').format(price);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-KZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function getOrderStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'Ожидает',
    CONFIRMED: 'Подтвержден',
    SHIPPED: 'Отправлен',
    DELIVERED: 'Доставлен',
    CANCELLED: 'Отменен',
  };
  return map[status] ?? status;
}

export function getOrderStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };
  return map[status] ?? 'bg-gray-100 text-gray-800';
}

export function getRoleLabel(role: string): string {
  const map: Record<string, string> = {
    FARMER: 'Фермер',
    B2B_BUYER: 'Оптовый покупатель',
    B2C_BUYER: 'Покупатель',
    ADMIN: 'Администратор',
  };
  return map[role] ?? role;
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getStoredCart() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('cart');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart: unknown[]) {
  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
}
