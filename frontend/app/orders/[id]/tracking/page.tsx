'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, Package, Truck, CheckCircle, Clock, Globe, User } from 'lucide-react';
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

// ── City → coordinates ───────────────────────────────────────────────────────

const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  // Kazakhstan cities
  'Алматы': { lat: 43.25, lon: 76.94 },
  'Almaty': { lat: 43.25, lon: 76.94 },
  'Астана': { lat: 51.18, lon: 71.45 },
  'Astana': { lat: 51.18, lon: 71.45 },
  'Нур-Султан': { lat: 51.18, lon: 71.45 },
  'Шымкент': { lat: 42.32, lon: 69.59 },
  'Shymkent': { lat: 42.32, lon: 69.59 },
  'Қарағанды': { lat: 49.80, lon: 73.10 },
  'Karaganda': { lat: 49.80, lon: 73.10 },
  'Атырау': { lat: 47.11, lon: 51.93 },
  'Ақтау': { lat: 43.65, lon: 51.17 },
  'Павлодар': { lat: 52.29, lon: 76.97 },
  'Semey': { lat: 50.40, lon: 80.23 },
  'Семей': { lat: 50.40, lon: 80.23 },
  'Тараз': { lat: 42.90, lon: 71.37 },
  'Қапшағай': { lat: 43.86, lon: 77.06 },
  'Өскемен': { lat: 49.95, lon: 82.61 },
  'Актобе': { lat: 50.28, lon: 57.21 },
  'Ақтөбе': { lat: 50.28, lon: 57.21 },
  'Петропавловск': { lat: 54.86, lon: 69.15 },
  'Қостанай': { lat: 53.21, lon: 63.63 },
  'Кокшетау': { lat: 53.28, lon: 69.40 },
  // International
  'Москва': { lat: 55.75, lon: 37.62 },
  'Moscow': { lat: 55.75, lon: 37.62 },
  'Дубай': { lat: 25.20, lon: 55.27 },
  'Dubai': { lat: 25.20, lon: 55.27 },
  'Пекин': { lat: 39.91, lon: 116.39 },
  'Beijing': { lat: 39.91, lon: 116.39 },
  'Стамбул': { lat: 41.01, lon: 28.96 },
  'Istanbul': { lat: 41.01, lon: 28.96 },
  'Лондон': { lat: 51.51, lon: -0.13 },
  'London': { lat: 51.51, lon: -0.13 },
  'Берлин': { lat: 52.52, lon: 13.40 },
  'Berlin': { lat: 52.52, lon: 13.40 },
  'Нью-Йорк': { lat: 40.71, lon: -74.01 },
  'New York': { lat: 40.71, lon: -74.01 },
  'Токио': { lat: 35.69, lon: 139.69 },
  'Tokyo': { lat: 35.69, lon: 139.69 },
  'Ташкент': { lat: 41.30, lon: 69.24 },
  'Tashkent': { lat: 41.30, lon: 69.24 },
  'Бишкек': { lat: 42.87, lon: 74.59 },
  'Bishkek': { lat: 42.87, lon: 74.59 },
};

const DEFAULT_ORIGIN = { lat: 43.25, lon: 76.94 }; // Almaty fallback
const DEFAULT_DEST   = { lat: 51.18, lon: 71.45 }; // Astana fallback

function resolveCoords(city?: string | null): { lat: number; lon: number } | null {
  if (!city) return null;
  return CITY_COORDS[city.trim()] ?? null;
}

// ── Progress ─────────────────────────────────────────────────────────────────

function computeProgress(order: Order): number {
  switch (order.status) {
    case 'PENDING':    return 0.04;
    case 'CONFIRMED':  return 0.14;
    case 'CANCELLED':  return 0;
    case 'DELIVERED':  return 1;
    case 'SHIPPED': {
      const shippedAt = new Date(order.updatedAt ?? order.createdAt).getTime();
      const elapsed = (Date.now() - shippedAt) / 1000;
      const TRANSIT_SECS = 3 * 24 * 3600;
      return 0.20 + Math.min(0.78, (elapsed / TRANSIT_SECS) * 0.78);
    }
    default: return 0;
  }
}

// ── Status steps ─────────────────────────────────────────────────────────────

const STATUS_STEPS = [
  { status: 'PENDING',   icon: Clock,        label: 'Заказ размещён',     desc: 'Ожидает подтверждения фермером' },
  { status: 'CONFIRMED', icon: CheckCircle,  label: 'Подтверждён',        desc: 'Фермер собирает заказ' },
  { status: 'SHIPPED',   icon: Truck,        label: 'В пути',             desc: 'Передан курьерской службе' },
  { status: 'DELIVERED', icon: Package,      label: 'Доставлен',          desc: 'Посылка получена' },
];

function statusIndex(status: string) {
  return STATUS_STEPS.findIndex((s) => s.status === status);
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!getStoredUser()) { router.push('/auth/login'); return; }
    ordersAPI.getById(id)
      .then((res) => {
        const o: Order = res.data;
        setOrder(o);
        setProgress(computeProgress(o));
      })
      .catch(() => { toast.error('Не удалось загрузить заказ'); router.push('/orders'); })
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => {
    if (!order || order.status !== 'SHIPPED') return;
    intervalRef.current = setInterval(() => setProgress(computeProgress(order)), 3000);
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

  // ── Resolve coordinates ────────────────────────────────────────────────────

  // Farmer city: from first item's product.farmer.city
  const farmerCity = order.items?.[0]?.product?.farmer?.city ?? null;
  const farmerName = order.items?.[0]?.product?.farmer?.name ?? null;

  const origin = resolveCoords(farmerCity) ?? DEFAULT_ORIGIN;
  const dest   = resolveCoords(order.deliveryCity) ?? DEFAULT_DEST;

  const curStepIdx = statusIndex(order.status);
  const isCancelled = order.status === 'CANCELLED';
  const eta = new Date(new Date(order.createdAt).getTime() + 3 * 24 * 3600 * 1000);

  const originLabel = farmerCity ?? 'Алматы';
  const destLabel   = order.deliveryCity ?? 'Астана';

  return (
    <div className="min-h-screen bg-[#060D1A] text-white">

      {/* ── Sticky header ─────────────────────────────────────────── */}
      <div className="border-b border-white/10 bg-[#050C18]/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="container-custom py-4 flex items-center gap-4">
          <Link href="/orders" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
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

          {/* ── Globe panel ─────────────────────────────────────────── */}
          <div className="relative">
            <div
              className="rounded-3xl overflow-hidden border border-white/10"
              style={{
                height: 'clamp(340px, 55vw, 600px)',
                background: 'radial-gradient(ellipse at 50% 40%, #0A2A4A 0%, #060D1A 70%)',
                boxShadow: '0 0 80px rgba(0,175,202,0.12), inset 0 0 40px rgba(0,0,0,0.6)',
              }}
            >
              {isCancelled ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                  <div className="text-6xl">❌</div>
                  <p className="text-red-400 font-bold text-lg">Заказ отменён</p>
                </div>
              ) : (
                <TrackingGlobeCanvas
                  originLat={origin.lat}
                  originLon={origin.lon}
                  destLat={dest.lat}
                  destLon={dest.lon}
                  progress={progress}
                />
              )}
            </div>

            {/* Route labels beneath globe */}
            {!isCancelled && (
              <div className="mt-4 px-2">
                {/* Progress bar */}
                <div className="flex justify-between items-center text-xs mb-2">
                  {/* From */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFD700] shadow-[0_0_6px_#FFD700] flex-shrink-0" />
                    <div>
                      <p className="text-[#FFD700] font-bold leading-none">{originLabel}</p>
                      {farmerName && <p className="text-gray-500 text-[10px]">{farmerName}</p>}
                    </div>
                  </div>

                  {/* Percentage */}
                  <span className="font-black text-white text-sm">{Math.round(progress * 100)}%</span>

                  {/* To */}
                  <div className="flex items-center gap-1.5 text-right">
                    <div>
                      <p className="text-[#00AFCA] font-bold leading-none">{destLabel}</p>
                      <p className="text-gray-500 text-[10px]">Покупатель</p>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00AFCA] shadow-[0_0_6px_#00AFCA] flex-shrink-0" />
                  </div>
                </div>

                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-[2s] ease-out"
                    style={{
                      width: `${progress * 100}%`,
                      background: 'linear-gradient(90deg, #C9A227, #FFD700 40%, #00AFCA)',
                    }}
                  />
                </div>

                {/* Legend */}
                <div className="mt-3 flex items-center justify-center gap-6 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-0.5 bg-gradient-to-r from-[#FFD700] to-[#C9A227] inline-block rounded" />
                    Пройдено
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-0.5 border-t border-dashed border-[#00AFCA]/60 inline-block" />
                    Осталось
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── Right info panel ────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Order ID */}
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-1">Заказ</p>
              <h1 className="text-2xl font-bold text-white">#{order.id.slice(-8).toUpperCase()}</h1>
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

            {/* Route card */}
            {!isCancelled && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Маршрут доставки</p>
                {/* Origin */}
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-7 h-7 rounded-full bg-[#FFD700]/15 flex items-center justify-center flex-shrink-0">
                    <User size={13} className="text-[#FFD700]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Отправитель (ферма)</p>
                    <p className="font-bold text-white">{farmerName ?? 'Фермер'}</p>
                    {farmerCity && <p className="text-sm text-[#FFD700]">📍 {farmerCity}</p>}
                  </div>
                </div>

                {/* Arrow line */}
                <div className="flex items-center gap-2 pl-3">
                  <div className="flex flex-col items-center gap-0.5">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-0.5 h-1.5 bg-white/15 rounded" />
                    ))}
                  </div>
                  <Truck size={14} className="text-[#00AFCA]" />
                  <span className="text-xs text-gray-500">Курьерская доставка</span>
                </div>

                {/* Destination */}
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-7 h-7 rounded-full bg-[#00AFCA]/15 flex items-center justify-center flex-shrink-0">
                    <MapPin size={13} className="text-[#00AFCA]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Получатель</p>
                    {order.deliveryCity && <p className="font-bold text-white">📍 {order.deliveryCity}</p>}
                    {order.deliveryAddress && <p className="text-sm text-gray-400 mt-0.5">{order.deliveryAddress}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Status timeline */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Статус</p>
              <div>
                {STATUS_STEPS.map((step, idx) => {
                  const isDone    = curStepIdx >= idx && !isCancelled;
                  const isCurrent = curStepIdx === idx && !isCancelled;
                  const isLast    = idx === STATUS_STEPS.length - 1;
                  const Icon = step.icon;
                  return (
                    <div key={step.status} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                          isCurrent ? 'bg-[#FFD700] text-[#0A2540] shadow-[0_0_16px_rgba(255,215,0,0.45)]'
                            : isDone ? 'bg-[#00AFCA]/20 text-[#00AFCA]'
                            : 'bg-white/5 text-gray-600'
                        }`}>
                          <Icon size={15} />
                        </div>
                        {!isLast && (
                          <div className={`w-0.5 h-8 mt-1 transition-all duration-700 ${isDone && curStepIdx > idx ? 'bg-[#00AFCA]/40' : 'bg-white/8'}`} />
                        )}
                      </div>
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

            {/* Items */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Товары</p>
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
                <span className="text-lg font-bold text-[#FFD700]">{order.totalAmount.toLocaleString()} ₸</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
