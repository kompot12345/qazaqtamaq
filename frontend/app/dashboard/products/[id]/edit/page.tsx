'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { getStoredUser } from '@/lib/utils';
import type { Category } from '@/types';

type FormState = {
  name: string;
  description: string;
  categoryId: string;
  retailPrice: string;
  wholesalePrice: string;
  exportPrice: string;
  retailStock: string;
  exportStock: string;
  moq: string;
  fatContent: string;
  feedingType: string;
  expirationDate: string;
  imageUrl: string;
  isAvailableRetail: boolean;
  isAvailableExport: boolean;
};

const EMPTY_FORM: FormState = {
  name: '', description: '', categoryId: '',
  retailPrice: '', wholesalePrice: '', exportPrice: '',
  retailStock: '', exportStock: '', moq: '',
  fatContent: '', feedingType: '', expirationDate: '',
  imageUrl: '', isAvailableRetail: true, isAvailableExport: false,
};

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    const user = getStoredUser();
    if (!user || user.role !== 'FARMER') {
      router.push('/auth/login');
      return;
    }

    Promise.all([
      productsAPI.getById(id),
      categoriesAPI.getAll(),
    ]).then(([productRes, catRes]) => {
      const p = productRes.data as Record<string, unknown>;
      setForm({
        name:              String(p.name ?? ''),
        description:       String(p.description ?? ''),
        categoryId:        String(p.categoryId ?? ''),
        retailPrice:       String(p.retailPrice ?? ''),
        wholesalePrice:    String(p.wholesalePrice ?? ''),
        exportPrice:       String(p.exportPrice ?? ''),
        retailStock:       String(p.retailStock ?? ''),
        exportStock:       String(p.exportStock ?? ''),
        moq:               p.moq ? String(p.moq) : '',
        fatContent:        String(p.fatContent ?? ''),
        feedingType:       String(p.feedingType ?? ''),
        expirationDate:    p.expirationDate ? String(p.expirationDate).slice(0, 10) : '',
        imageUrl:          String(p.imageUrl ?? ''),
        isAvailableRetail: Boolean(p.isAvailableRetail ?? true),
        isAvailableExport: Boolean(p.isAvailableExport ?? false),
      });
      setCategories(catRes.data || []);
    }).catch(() => {
      toast.error('Продукт не найден');
      router.push('/dashboard');
    }).finally(() => setFetching(false));
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await productsAPI.update(id, {
        ...form,
        retailPrice:    parseFloat(form.retailPrice),
        wholesalePrice: parseFloat(form.wholesalePrice),
        exportPrice:    parseFloat(form.exportPrice),
        retailStock:    parseInt(form.retailStock),
        exportStock:    parseInt(form.exportStock || '0'),
        moq:            form.moq ? parseInt(form.moq) : undefined,
        expirationDate: form.expirationDate || undefined,
      });
      toast.success('Продукт обновлён!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Ошибка обновления';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, key: keyof FormState, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-semibold text-gray-200 mb-2">{label}</label>
      <input
        type={type}
        value={form[key] as string}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-white/6 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#00AFCA]/50 focus:bg-white/8 transition-all"
      />
    </div>
  );

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#060D1A] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#00AFCA]/30 border-t-[#00AFCA] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060D1A]">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0A2540] via-[#0D3256] to-[#060D1A] py-14">
        <div className="container-custom relative z-10">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-5 transition-colors text-sm"
          >
            <ArrowLeft size={16} /> Назад в кабинет
          </Link>
          <p className="text-[#C9A227] text-[10px] font-black tracking-[0.2em] mb-3">FARMER DASHBOARD</p>
          <h1 className="text-4xl font-black text-white flex items-center gap-3 tracking-tight">
            <Package size={36} className="text-[#C9A227]" /> Редактировать продукт
          </h1>
        </div>
      </div>

      <div className="container-custom py-10 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic info */}
          <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-7">
            <h2 className="text-base font-bold text-white mb-5">Основная информация</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field('Название продукта *', 'name', 'text', 'Говядина Мраморная')}
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">Категория</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full px-4 py-3 bg-white/6 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#00AFCA]/50 focus:bg-white/8 transition-all"
                >
                  <option value="" className="bg-[#0A2540]">Выберите категорию</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#0A2540]">{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-200 mb-2">Описание *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Опишите продукт..."
                rows={3}
                required
                className="w-full px-4 py-3 bg-white/6 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#00AFCA]/50 focus:bg-white/8 transition-all resize-none"
              />
            </div>
            {field('URL изображения', 'imageUrl', 'url', 'https://example.com/image.jpg')}
          </div>

          {/* Prices */}
          <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-7">
            <h2 className="text-base font-bold text-white mb-5">Цены (₸/кг)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {field('Розничная цена *', 'retailPrice', 'number', '1500')}
              {field('Оптовая цена *', 'wholesalePrice', 'number', '1200')}
              {field('Экспортная цена *', 'exportPrice', 'number', '1000')}
            </div>
          </div>

          {/* Stock */}
          <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-7">
            <h2 className="text-base font-bold text-white mb-5">Склад (кг)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {field('Розничный склад *', 'retailStock', 'number', '100')}
              {field('Экспортный склад', 'exportStock', 'number', '500')}
              {field('Мин. партия (MOQ)', 'moq', 'number', '50')}
            </div>
            <div className="mt-5 flex flex-wrap gap-6">
              {([
                ['isAvailableRetail', 'Доступен для розницы'],
                ['isAvailableExport', 'Доступен для экспорта'],
              ] as [keyof FormState, string][]).map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[key] as boolean}
                    onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                    className="w-4 h-4 accent-[#00AFCA]"
                  />
                  <span className="text-sm font-medium text-gray-300">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Characteristics */}
          <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-7">
            <h2 className="text-base font-bold text-white mb-5">Характеристики</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {field('Жирность', 'fatContent', 'text', 'Мраморность 5%')}
              {field('Тип кормления', 'feedingType', 'text', 'Травяной')}
              {field('Срок годности', 'expirationDate', 'date')}
            </div>
          </div>

          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="flex-1 flex items-center justify-center py-4 font-bold text-gray-300 rounded-xl border border-white/12 hover:border-white/25 hover:text-white hover:bg-white/5 transition-all"
            >
              Отмена
            </Link>
            <button
              type="submit"
              disabled={loading || !form.name || !form.description || !form.retailPrice}
              className="flex-1 flex items-center justify-center gap-2 py-4 font-bold text-[#0A2540] rounded-xl transition-all hover:shadow-[0_0_24px_rgba(201,162,39,0.4)] hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              style={{ background: 'linear-gradient(135deg, #C9A227, #FFD700)' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#0A2540]/30 border-t-[#0A2540] rounded-full animate-spin" />
              ) : (
                <><Save size={18} /> Сохранить изменения</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
