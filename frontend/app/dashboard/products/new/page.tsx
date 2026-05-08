'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { getStoredUser } from '@/lib/utils';
import type { Category } from '@/types';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    retailPrice: '',
    wholesalePrice: '',
    exportPrice: '',
    retailStock: '',
    exportStock: '',
    moq: '',
    fatContent: '',
    feedingType: '',
    expirationDate: '',
    imageUrl: '',
    isAvailableRetail: true,
    isAvailableExport: false,
  });

  useEffect(() => {
    const user = getStoredUser();
    if (!user || user.role !== 'FARMER') {
      router.push('/auth/login');
      return;
    }
    categoriesAPI.getAll().then((r) => setCategories(r.data || [])).catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await productsAPI.create({
        ...form,
        retailPrice: parseFloat(form.retailPrice),
        wholesalePrice: parseFloat(form.wholesalePrice),
        exportPrice: parseFloat(form.exportPrice),
        retailStock: parseInt(form.retailStock),
        exportStock: parseInt(form.exportStock || '0'),
        moq: form.moq ? parseInt(form.moq) : undefined,
        expirationDate: form.expirationDate || undefined,
      });
      toast.success('Продукт создан!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Ошибка создания продукта';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, key: keyof typeof form, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        value={form[key] as string}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="input-field"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-sky-50/30">
      <div className="bg-gradient-to-br from-[#0A2540] to-[#0D3256] py-14">
        <div className="container-custom">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors">
            <ArrowLeft size={18} /> Назад в кабинет
          </Link>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Package size={40} /> Новый продукт
          </h1>
        </div>
      </div>

      <div className="container-custom py-10 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-8">
            <h2 className="text-xl font-bold text-[#0A2540] mb-6">Основная информация</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {field('Название продукта *', 'name', 'text', 'Говядина Мраморная')}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Категория</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="input-field"
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Описание *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Опишите продукт: откуда, как выращен, особенности..."
                rows={4}
                required
                className="input-field resize-none"
              />
            </div>
            {field('URL изображения', 'imageUrl', 'url', 'https://example.com/image.jpg')}
          </div>

          <div className="card p-8">
            <h2 className="text-xl font-bold text-[#0A2540] mb-6">Цены (₸/кг)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {field('Розничная цена *', 'retailPrice', 'number', '1500')}
              {field('Оптовая цена *', 'wholesalePrice', 'number', '1200')}
              {field('Экспортная цена *', 'exportPrice', 'number', '1000')}
            </div>
          </div>

          <div className="card p-8">
            <h2 className="text-xl font-bold text-[#0A2540] mb-6">Склад (кг)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {field('Розничный склад *', 'retailStock', 'number', '100')}
              {field('Экспортный склад', 'exportStock', 'number', '500')}
              {field('Мин. партия (MOQ)', 'moq', 'number', '50')}
            </div>
            <div className="mt-5 flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isAvailableRetail}
                  onChange={(e) => setForm({ ...form, isAvailableRetail: e.target.checked })}
                  className="w-4 h-4 accent-[#0089A7]"
                />
                <span className="font-medium text-gray-700">Доступен для розницы</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isAvailableExport}
                  onChange={(e) => setForm({ ...form, isAvailableExport: e.target.checked })}
                  className="w-4 h-4 accent-[#0089A7]"
                />
                <span className="font-medium text-gray-700">Доступен для экспорта</span>
              </label>
            </div>
          </div>

          <div className="card p-8">
            <h2 className="text-xl font-bold text-[#0A2540] mb-6">Характеристики</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {field('Жирность', 'fatContent', 'text', 'Мраморность 5%')}
              {field('Тип кормления', 'feedingType', 'text', 'Травяной')}
              {field('Срок годности', 'expirationDate', 'date')}
            </div>
          </div>

          <div className="flex gap-4">
            <Link href="/dashboard" className="flex-1 btn-secondary text-center py-4">
              Отмена
            </Link>
            <button
              type="submit"
              disabled={loading || !form.name || !form.description || !form.retailPrice}
              className="flex-1 flex items-center justify-center gap-2 btn-primary py-4 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} /> Создать продукт
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
