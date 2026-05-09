'use client';

import { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, Package, ShoppingBag, MapPin } from 'lucide-react';
import { analyticsAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

type SalesData = {
  salesByDay: { date: string; revenue: number }[];
  topProducts: { name: string; revenue: number; qty: number }[];
  summary: { totalRevenue: number; totalOrders: number; totalKg: number };
};

type DeliveryData = {
  deliveryByCity: { city: string; count: number; revenue: number }[];
  statusDist: { status: string; count: number }[];
  total: number;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Ожидает', CONFIRMED: 'Подтверждён', SHIPPED: 'В пути',
  DELIVERED: 'Доставлен', CANCELLED: 'Отменён',
};
const COLORS = ['#00AFCA', '#C9A227', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];

function KpiCard({ icon: Icon, label, value, sub }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-[#00AFCA]/10 flex items-center justify-center">
          <Icon size={18} className="text-[#00AFCA]" />
        </div>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

const fmtDate = (d: string) => {
  const dt = new Date(d);
  return `${dt.getDate()}.${String(dt.getMonth() + 1).padStart(2, '0')}`;
};

export default function AnalyticsTab() {
  const [sales, setSales] = useState<SalesData | null>(null);
  const [deliveries, setDeliveries] = useState<DeliveryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsAPI.farmerSales(), analyticsAPI.farmerDeliveries()])
      .then(([s, d]) => {
        setSales(s.data);
        setDeliveries(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-2 border-[#00AFCA]/30 border-t-[#00AFCA] rounded-full animate-spin" />
      </div>
    );
  }

  const s = sales!;
  const d = deliveries!;

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard icon={TrendingUp} label="Выручка за 30 дней" value={`${formatPrice(s.summary.totalRevenue)} ₸`} sub="только выполненные заказы" />
        <KpiCard icon={ShoppingBag} label="Заказов за 30 дней" value={String(s.summary.totalOrders)} />
        <KpiCard icon={Package} label="Продано (кг)" value={`${s.summary.totalKg} кг`} sub="за последние 30 дней" />
      </div>

      {/* Revenue chart */}
      <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6">
        <h3 className="text-sm font-bold text-white mb-4">Выручка по дням (₸)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={s.salesByDay} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00AFCA" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00AFCA" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill: '#6B7280', fontSize: 11 }} interval={4} />
            <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: '#0A2540', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
              labelStyle={{ color: '#9CA3AF', fontSize: 12 }}
              formatter={(v) => [`${formatPrice(Number(v))} ₸`, 'Выручка']}
              labelFormatter={(l) => fmtDate(String(l))}
            />
            <Area type="monotone" dataKey="revenue" stroke="#00AFCA" strokeWidth={2} fill="url(#revGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6">
          <h3 className="text-sm font-bold text-white mb-4">Топ продуктов по выручке</h3>
          {s.topProducts.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Нет данных</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={s.topProducts} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 11 }} width={90} />
                <Tooltip
                  contentStyle={{ background: '#0A2540', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  formatter={(v) => [`${formatPrice(Number(v))} ₸`, 'Выручка']}
                />
                <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                  {s.topProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Delivery by city */}
        <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6">
          <h3 className="text-sm font-bold text-white mb-1">География доставок</h3>
          <p className="text-xs text-gray-500 mb-4 flex items-center gap-1"><MapPin size={11} /> Всего заказов: {d.total}</p>
          {d.deliveryByCity.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Нет данных</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={d.deliveryByCity}
                  dataKey="count"
                  nameKey="city"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                >
                  {d.deliveryByCity.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0A2540', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  formatter={(v, _name, props) => [
                    `${v} заказов · ${formatPrice((props as { payload?: { revenue?: number } })?.payload?.revenue ?? 0)} ₸`,
                    (props as { payload?: { city?: string } })?.payload?.city ?? '',
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Status distribution */}
      <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6">
        <h3 className="text-sm font-bold text-white mb-4">Статусы заказов</h3>
        <div className="flex flex-wrap gap-3">
          {d.statusDist.map((s, i) => (
            <div key={s.status} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/8 bg-white/[0.03]">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="text-sm text-gray-300">{STATUS_LABELS[s.status] ?? s.status}</span>
              <span className="text-sm font-bold text-white">{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
