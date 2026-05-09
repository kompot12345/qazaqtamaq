'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, Package, Truck, CheckCircle, Clock, Globe } from 'lucide-react';
import { ordersAPI } from '@/lib/api';
import { formatDate, getStoredUser } from '@/lib/utils';
import type { Order } from '@/types';

const TrackingGlobeCanvas = dynamic(
  () => import('@/components/three/TrackingGlobeCanvas'),
  { ssr: false, loading: () => <GlobeSkeleton /> },
);

function GlobeSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-32 h-32 rounded-full border-4 border-[#FFD700]/30 border-t-[#FFD700] animate-spin" />
    </div>
  );
}

// City → coordinates map
const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  // Kazakhstan
  'Алматы': { lat: 43.25, lon: 76.94 },
  'Астана': { lat: 51.18, lon: 71.45 },
  'Шымкент': { lat: 42.32, lon: 69.59 },
  'Қарағанды': { lat: 49.8, lon: 73.1 },
  'Атырау': { lat: 47.11, lon: 51.93 },
  'Ақтау': { lat: 43.65, lon: 51.17 },
  'Павлодар': { lat: 52.29, lon: 76.97 },
  'Semey': { lat: 50.4, lon: 80.23 },
  'Тараз': { lat: 42.9, lon: 71.37 },
  // International
  'Москва': { lat: 55.75, lon: 37.62 },
  'Moscow': { lat: 55.75, lon: 37.62 },
  'Дубай': { lat: 25.2, lon: 55.27 },
  'Dubai': { lat: 25.2, lon: 55.27 },
  'Пекин': { lat: 39.91, lon: 116.39 },
  'Beijing': { lat: 39.91, lon: 116.39 },
  'Стамбул': { lat: 41.01, lon: 28.96 },
  'Istanbul': { lat: 41.01, lon: 28.96 },
  'Лондон': { lat: 51.51, lon: -0.13 },
  'London': { lat: 51.51, lon: -0.13 },
  'Берлин': { lat: 52.52, lon: 13.4 },
  'Berlin': { lat: 52.52, lon: 13.4 },
  'Нью-Йорк': { lat: 40.71, lon: -74.01 },
  'New York': { lat: 40.71, lon: -74.01 },
  'Токио': { lat: 35.69, lon: 139.69 },
  'Tokyo': { lat: 35.69, lon: 139.69 },
  'Ташкент': { lat: 41.3, lon: 69.24 },
  'Бишкек': { lat: 42.87, lon: 74.59 },
};

// Warehouse origin — Almaty sorting center
const ORIGIN = { lat: 43.25, lon: 76.94 };

function getDestCoords(city?: string): { lat: number; lon: number } {
  if (!city) return { lat: 51.18, lon: 71.45 }; // default Astana
  const normalized = city.trim();
  return CITY_COORDS[normalized] ?? { lat: 51.18, lon: 71.45 };
}

function computeProgress(order: Order): number {
  switch (order.status) {
    case 'PENDING':    return 0.04;
    case 'CONFIRMED':  return 0.12;
    case 'CANCELLED':  return 0;
    case 'DELIVERED':  return 1;
    case 'SHIPPED': {
      const shippedAt = new Date(order.updatedAt ?? order.createdAt).getTime();
      const elapsed = (Date.now() - shippedAt) / 1000;
      const TRANSIT_SECS = 3 * 24 * 3600; // 3 days transit window
      return 0.18 + Math.min(0.8, elapsed / TRANSIT_SECS * 0.8);
    }
    default: return 0;
  }
}

const STATUS_STEPS = [
  { status: 'PENDING',   icon: Clock,       label: 'Заказ размещён',    desc: 'Ожидает подтверждения' },
  { status: 'CONFIRMED', icon: CheckCircle,  label: 'Подтверждён',       desc: 'Передаётся на склад' },
  { status: 'SHIPPED',   icon: Truck,        label: 'В пути',            desc: 'Передан курьерской службе' },
  { status: 'DELIVERED', icon: Package,      label: 'Доставлен',         desc: 'Посылка получена' },
];

function statusIndex(status: string): number {
  return STATUS_STEPS.findIndex((s) => s.status === status);
}

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) { router.push('/auth/login'); return; }

    ordersAPI.getById(id)
      .then((res) => {
        const o: Order = res.data;
        setOrder(o);
        setProgress(computeProgress(o));
      })
      .catch(() => { toast.error('Не удалось загрузить заказ'); router.push('/orders'); })
      .finally(() => setLoading(false));
  }, [id, router]);

  // Tick progress forward in real-time when order is SHIPPED
  useEffect(() => {
    if (!order || order.status !== 'SHIPPED') return;
    intervalRef.current = setInterval(() => {
      setProgress(computeProgress(order));
    }, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060D1A] flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-[#FFD700]/30 border-t-[#FFD700] animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  const dest = getDestCoords(order.deliveryCity);
  const curStepIdx = statusIndex(order.status);
  const isCancelled = order.status === 'CANCELLED';
  const eta = new Date(new Date(order.createdAt).getTime() + 3 * 24 * 3600 * 1000);

  return (
    <div className="min-h-screen bg-[#060D1A] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#050C18]/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="container-custom py-4 flex items-center gap-4">
          <Link
            href="/orders"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Мои заказы</span>
          </Link>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-[#FFD700]" />
            <span className="text-sm font-bold text-[#FFD700]">Отслеживание доставки</span>
          </div>
        </div>
      </div>

      <div className="container-custom py-8 lg:py-12">
        <div className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-12 items-start">

          {/* Globe */}
          <div className="relative">
            <div
              className="rounded-3xl overflow-hidden border border-white/10"
              style={{
                height: 'clamp(320px, 55vw, 580px)',
                background: 'radial-gradient(ellipse at 50% 40%, #0A2A4A 0%, #060D1A 70%)',
                boxShadow: '0 0 80px rgba(0,175,202,0.12), inset 0 0 40px rgba(0,0,0,0.6)',
              }}
            >
              {!isCancelled && (
                <TrackingGlobeCanvas
                  originLat={ORIGIN.lat}
                  originLon={ORIGIN.lon}
                  destLat={dest.lat}
                  destLon={dest.lon}
                  progress={progress}
                />
              )}
              {isCancelled && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                  <div className="text-6xl">❌</div>
                  <p className="text-red-400 font-bold text-lg">Заказ отменён</p>
                </div>
              )}
            </div>

            {/* Progress bar under globe */}
            {!isCancelled && (
              <div className="mt-4 px-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#FFD700] inline-block" />
                    Алматы (склад)
                  </span>
                  <span className="font-bold text-white">{Math.round(progress * 100)}%</span>
                  <span className="flex items-center gap-1">
                    {order.deliveryCity || 'Астана'}
                    <span className="w-2 h-2 rounded-full bg-[#00AFCA] inline-block" />
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-[2s] ease-out"
                    style={{
                      width: `${progress * 100}%`,
                      background: 'linear-gradient(90deg, #C9A227, #FFD700, #00AFCA)',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Legend */}
            {!isCancelled && (
              <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[#FFD700] inline-block rounded" />
                  Пройдено
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t border-dashed border-[#00AFCA] inline-block" />
                  Осталось
                </span>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="space-y-6">
            {/* Order ID */}
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-1">Заказ</p>
              <h1 className="text-2xl font-bold text-white">
                #{order.id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">{formatDate(order.createdAt)}</p>
            </div>

            {/* ETA */}
            {!isCancelled && order.status !== 'DELIVERED' && (
              <div className="bg-gradient-to-br from-[#FFD700]/10 to-[#00AFCA]/5 border border-[#FFD700]/20 rounded-2xl p-4">
                <p className="text-xs text-gray-400 mb-0.5">Ожидаемая доставка</p>
                <p className="text-lg font-bold text-[#FFD700]">
                  {eta.toLocaleDateString('ru-KZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            )}

            {/* Delivery address */}
            {(order.deliveryCity || order.deliveryAddress) && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={14} className="text-[#00AFCA]" />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Адрес доставки</span>
                </div>
                {order.deliveryCity && (
                  <p className="font-bold text-white">{order.deliveryCity}</p>
                )}
                {order.deliveryAddress && (
                  <p className="text-sm text-gray-400 mt-0.5">{order.deliveryAddress}</p>
                )}
              </div>
            )}

            {/* Status timeline */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Статус</p>
              <div className="space-y-0">
                {STATUS_STEPS.map((step, idx) => {
                  const isDone   = curStepIdx >= idx && !isCancelled;
                  const isCurrent = curStepIdx === idx && !isCancelled;
                  const isLast   = idx === STATUS_STEPS.length - 1;
                  const Icon = step.icon;
                  return (
                    <div key={step.status} className="flex gap-4">
                      {/* Line + Icon */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                            isCurrent
                              ? 'bg-[#FFD700] text-[#0A2540] shadow-[0_0_16px_rgba(255,215,0,0.5)]'
                              : isDone
                              ? 'bg-[#00AFCA]/20 text-[#00AFCA]'
                              : 'bg-white/5 text-gray-600'
                          }`}
                        >
                          <Icon size={15} />
                        </div>
                        {!isLast && (
                          <div
                            className={`w-0.5 h-8 mt-1 transition-all duration-700 ${
                              isDone && curStepIdx > idx ? 'bg-[#00AFCA]/40' : 'bg-white/10'
                            }`}
                          />
                        )}
                      </div>
                      {/* Text */}
                      <div className="pb-6">
                        <p className={`font-bold text-sm ${isCurrent ? 'text-[#FFD700]' : isDone ? 'text-white' : 'text-gray-600'}`}>
                          {step.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items summary */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Товары</p>
              <div className="space-y-2">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300 truncate max-w-[200px]">
                      {item.product?.name || 'Товар'} × {item.quantity} кг
                    </span>
                    <span className="font-bold text-white ml-2">
                      {(item.price * item.quantity).toLocaleString()} ₸
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 flex justify-between">
                <span className="text-gray-400">Итого</span>
                <span className="text-lg font-bold text-[#FFD700]">
                  {order.totalAmount.toLocaleString()} ₸
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
