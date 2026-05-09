'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import {
  Plus, Package, TrendingUp, ShoppingBag, Edit, Trash2,
  BarChart3, Star, AlertTriangle, RefreshCw, Sliders, ChevronRight,
  Video, MapPin, FileText, X,
} from 'lucide-react';
import { productsAPI, ordersAPI } from '@/lib/api';
import { formatPrice, formatDate, getOrderStatusLabel, getStoredUser } from '@/lib/utils';
import type { Product, Order } from '@/types';

const FarmerCanvas = dynamic(() => import('@/components/three/FarmerCanvas'), {
  ssr: false,
  loading: () => <div className="w-full h-full" />,
});
const AnalyticsTab = dynamic(() => import('@/components/dashboard/AnalyticsTab'), { ssr: false });
const CamerasTab = dynamic(() => import('@/components/dashboard/CamerasTab'), { ssr: false });

type TabKey = 'overview' | 'products' | 'cameras' | 'analytics' | 'inventory' | 'orders';

interface InventorySlider {
  productId: string;
  total: number;
  retail: number;
  export_: number;
  saving: boolean;
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-500/15 text-yellow-300',
  CONFIRMED: 'bg-blue-500/15 text-blue-300',
  SHIPPED: 'bg-purple-500/15 text-purple-300',
  DELIVERED: 'bg-green-500/15 text-green-300',
  CANCELLED: 'bg-red-500/15 text-red-300',
};

export default function DashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [inventorySliders, setInventorySliders] = useState<Record<string, InventorySlider>>({});

  const user = getStoredUser();

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (user.role !== 'FARMER' && user.role !== 'ADMIN') { router.push('/'); return; }

    Promise.all([
      productsAPI.getFarmerProducts(),
      ordersAPI.getFarmerOrders().catch(() => ({ data: [] })),
    ]).then(([productsRes, ordersRes]) => {
      setProducts(productsRes.data?.data || productsRes.data || []);
      setOrders(ordersRes.data?.data || ordersRes.data || []);
    }).catch(() => toast.error('Ошибка загрузки данных'))
      .finally(() => setLoading(false));
  }, [router]);

  const initSliders = useCallback((prods: Product[]) => {
    const sliders: Record<string, InventorySlider> = {};
    prods.forEach((p) => {
      sliders[p.id] = { productId: p.id, total: p.retailStock + p.exportStock, retail: p.retailStock, export_: p.exportStock, saving: false };
    });
    setInventorySliders(sliders);
  }, []);

  useEffect(() => { if (products.length > 0) initSliders(products); }, [products, initSliders]);

  const handleSliderChange = (productId: string, retailValue: number) => {
    setInventorySliders((prev) => {
      const s = prev[productId];
      if (!s) return prev;
      return { ...prev, [productId]: { ...s, retail: retailValue, export_: s.total - retailValue } };
    });
  };

  const saveInventory = async (productId: string) => {
    const s = inventorySliders[productId];
    if (!s) return;
    setInventorySliders((prev) => ({ ...prev, [productId]: { ...s, saving: true } }));
    try {
      await productsAPI.syncInventory(productId, s.retail, s.export_);
      setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, retailStock: s.retail, exportStock: s.export_ } : p));
      toast.success('Запасы синхронизированы!');
    } catch {
      toast.error('Ошибка синхронизации');
    } finally {
      setInventorySliders((prev) => ({ ...prev, [productId]: { ...prev[productId], saving: false } }));
    }
  };

  const confirmDeleteProduct = async () => {
    if (!confirmDelete) return;
    const { id } = confirmDelete;
    setConfirmDelete(null);
    setDeletingId(id);
    try {
      await productsAPI.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Продукт удалён');
    } catch {
      toast.error('Не удалось удалить продукт');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await ordersAPI.updateStatus(orderId, status);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: status as Order['status'] } : o));
      toast.success('Статус обновлён');
    } catch {
      toast.error('Ошибка обновления статуса');
    }
  };

  const totalRevenue = orders.filter((o) => o.status === 'DELIVERED').reduce((s, o) => s + o.totalAmount, 0);
  const lowStockProducts = products.filter((p) => p.retailStock < 10);

  const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Обзор', icon: <BarChart3 size={15} /> },
    { key: 'products', label: 'Продукты', icon: <Package size={15} /> },
    { key: 'cameras', label: 'CCTV', icon: <Video size={15} /> },
    { key: 'analytics', label: 'Аналитика', icon: <TrendingUp size={15} /> },
    { key: 'inventory', label: 'Запасы', icon: <Sliders size={15} /> },
    { key: 'orders', label: 'Заказы', icon: <ShoppingBag size={15} /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060D1A] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#00AFCA]/30 border-t-[#00AFCA] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060D1A]">

      {/* ── Hero header ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#060D1A] via-[#0A2540] to-[#0D3256]">
        <div className="container-custom py-10 relative z-10">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-0 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#C9A227,#FFD700)' }}>
                  <BarChart3 size={16} className="text-[#0A2540]" />
                </div>
                <span className="text-[#FFD700] text-xs font-black tracking-[0.2em] uppercase">Фермер кабинеті</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight">
                Сәлем, <span style={{ color: '#FFD700' }}>{user?.name}</span>!
              </h1>
              <p className="text-gray-400 mt-2 text-sm max-w-sm">Өнімдеріңізді басқарып, тапсырыстарды қадағалаңыз.</p>
              <div className="flex items-center gap-3 mt-5 flex-wrap">
                <Link href="/dashboard/products/new"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-[#0A2540] transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'linear-gradient(135deg,#C9A227,#FFD700)' }}>
                  <Plus size={16} /> Өнім қосу
                </Link>
                <Link href="/products" className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border border-white/20 text-white hover:bg-white/10 transition-all">
                  Дүкенге өту →
                </Link>
              </div>
            </div>

            <div className="hidden lg:flex items-end gap-4 flex-shrink-0">
              <div className="flex flex-col items-center">
                <div className="relative mb-1">
                  <div className="bg-white/10 backdrop-blur-sm border border-[#FFD700]/30 rounded-2xl rounded-br-none px-4 py-2.5">
                    <p className="text-white text-xs font-semibold leading-relaxed max-w-[160px]">
                      Жаңа тапсырыстар<br /><span className="text-[#FFD700]">сізді күтуде! 🌾</span>
                    </p>
                  </div>
                  <div className="absolute -bottom-2 right-3 w-0 h-0" style={{ borderLeft: '8px solid transparent', borderTop: '8px solid rgba(255,215,0,0.3)' }} />
                </div>
                <div className="w-[160px] h-[240px]">
                  <FarmerCanvas gender="male" waving cameraY={1.05} cameraZ={3.2} />
                </div>
              </div>
              <div className="mb-6 space-y-2">
                {[{ label: 'Өнімдер', value: products.length, color: '#00AFCA' }, { label: 'Тапсырыстар', value: orders.length, color: '#FFD700' }].map((item) => (
                  <div key={item.label} className="bg-white/8 backdrop-blur border border-white/10 rounded-xl px-4 py-2.5 text-center min-w-[90px]">
                    <p className="text-xl font-black" style={{ color: item.color }}>{item.value}</p>
                    <p className="text-white/60 text-xs">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="h-px" style={{ background: 'linear-gradient(90deg,transparent,#FFD700,transparent)' }} />
      </div>

      <div className="container-custom py-8">

        {/* ── KPI cards ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Продуктов', value: products.length, icon: Package, grad: 'from-[#00AFCA] to-[#0089A7]' },
            { label: 'Заказов', value: orders.length, icon: ShoppingBag, grad: 'from-blue-500 to-blue-600' },
            { label: 'Выручка (₸)', value: formatPrice(totalRevenue), icon: TrendingUp, grad: 'from-[#D4AF37] to-[#E8C547]', dark: true },
            { label: 'Ср. рейтинг', value: '4.8 ★', icon: Star, grad: 'from-purple-500 to-purple-600' },
          ].map((stat) => (
            <div key={stat.label} className={`bg-gradient-to-br ${stat.grad} rounded-2xl p-5 text-white shadow-lg`}>
              <stat.icon size={22} className={`mb-3 ${stat.dark ? 'text-[#0A2540]' : 'text-white/80'}`} />
              <p className={`text-2xl font-black mb-1 ${stat.dark ? 'text-[#0A2540]' : ''}`}>{stat.value}</p>
              <p className={`text-sm ${stat.dark ? 'text-[#0A2540]/70' : 'text-white/70'}`}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Alerts ───────────────────────────────────────────────── */}
        {lowStockProducts.length > 0 && (
          <div className="flex gap-3 p-4 mb-6 rounded-2xl border border-orange-400/20 bg-orange-400/5">
            <AlertTriangle size={18} className="text-orange-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-orange-300">
              <span className="font-bold">Низкий запас:</span> {lowStockProducts.map((p) => p.name).join(', ')} — менее 10 кг
            </p>
          </div>
        )}

        {/* ── Tabs ─────────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-white/[0.04] border border-white/8 rounded-xl p-1 mb-8 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 flex-shrink-0 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === tab.key
                  ? 'bg-white/10 text-white border border-white/15'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── Overview ─────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Farm info card */}
            <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <FileText size={16} className="text-[#C9A227]" /> Профиль фермы
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Фермер</p>
                  <p className="text-white font-semibold">{user?.name}</p>
                  <p className="text-gray-400 text-sm">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><MapPin size={10} /> Местоположение</p>
                  <p className="text-white font-semibold">{user?.city || 'Не указано'}</p>
                  <Link href="/profile" className="text-xs text-[#00AFCA] hover:underline">Обновить →</Link>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Статус верификации</p>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${user?.isVerified ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${user?.isVerified ? 'bg-green-400' : 'bg-yellow-400'}`} />
                    {user?.isVerified ? 'Верифицирован' : 'На проверке'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick access shortcuts */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'Добавить продукт', sub: 'Новый листинг', icon: Plus, href: '/dashboard/products/new', color: '#C9A227' },
                { label: 'CCTV камеры', sub: 'Мониторинг фермы', icon: Video, tab: 'cameras' as TabKey, color: '#00AFCA' },
                { label: 'Аналитика продаж', sub: 'Графики и отчёты', icon: TrendingUp, tab: 'analytics' as TabKey, color: '#8B5CF6' },
              ].map((item) => (
                item.href ? (
                  <Link key={item.label} href={item.href}
                    className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-5 hover:border-white/20 transition-all group">
                    <div className="w-9 h-9 rounded-xl mb-3 flex items-center justify-center" style={{ background: `${item.color}20` }}>
                      <item.icon size={18} style={{ color: item.color }} />
                    </div>
                    <p className="text-white font-bold text-sm">{item.label}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{item.sub}</p>
                  </Link>
                ) : (
                  <button key={item.label} onClick={() => setActiveTab(item.tab!)}
                    className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-5 hover:border-white/20 transition-all text-left group">
                    <div className="w-9 h-9 rounded-xl mb-3 flex items-center justify-center" style={{ background: `${item.color}20` }}>
                      <item.icon size={18} style={{ color: item.color }} />
                    </div>
                    <p className="text-white font-bold text-sm">{item.label}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{item.sub}</p>
                  </button>
                )
              ))}
            </div>

            {/* Recent products + orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">Последние продукты</h3>
                  <button onClick={() => setActiveTab('products')} className="text-xs text-[#C9A227] hover:underline">Все →</button>
                </div>
                {products.slice(0, 4).map((product) => (
                  <div key={product.id} className="flex items-center gap-3 py-3 border-b border-white/6 last:border-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                      {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">🥩</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-white truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.retailStock} кг на складе</p>
                    </div>
                    <p className="text-sm font-bold text-[#C9A227]">{formatPrice(product.retailPrice)} ₸</p>
                  </div>
                ))}
                {products.length === 0 && <p className="text-center text-gray-600 py-8">Нет продуктов</p>}
              </div>

              <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">Последние заказы</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-xs text-[#C9A227] hover:underline">Все →</button>
                </div>
                {orders.slice(0, 4).map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b border-white/6 last:border-0">
                    <div>
                      <p className="font-semibold text-sm text-white">#{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{formatPrice(order.totalAmount)} ₸</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status] ?? 'bg-gray-500/15 text-gray-400'}`}>{getOrderStatusLabel(order.status)}</span>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && <p className="text-center text-gray-600 py-8">Нет заказов</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── Products ─────────────────────────────────────────────── */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-400 text-sm">{products.length} продуктов</p>
              <Link href="/dashboard/products/new"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-[#0A2540]"
                style={{ background: 'linear-gradient(135deg,#C9A227,#FFD700)' }}>
                <Plus size={16} /> Новый продукт
              </Link>
            </div>
            {products.length === 0 ? (
              <div className="text-center py-20 rounded-2xl border border-dashed border-white/10">
                <Package size={44} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">У вас нет продуктов</p>
                <Link href="/dashboard/products/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-[#0A2540]" style={{ background: 'linear-gradient(135deg,#C9A227,#FFD700)' }}>
                  <Plus size={16} /> Добавить первый продукт
                </Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {products.map((product) => (
                  <div key={product.id} className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-5 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                      {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🥩</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white">{product.name}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-sm text-gray-400">Розница: <span className="text-[#C9A227] font-semibold">{formatPrice(product.retailPrice)} ₸</span></span>
                        <span className="text-sm text-gray-500">{product.retailStock} кг</span>
                        {product.discountActive && <span className="text-xs bg-orange-500/15 text-orange-400 px-2 py-0.5 rounded-full font-bold">Скидка 30%</span>}
                        {product.retailStock < 10 && <span className="text-xs text-orange-400 font-semibold">⚠ Мало</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/products/${product.id}/edit`}
                        className="p-2.5 rounded-xl border border-white/10 hover:border-white/25 hover:bg-white/5 transition-all">
                        <Edit size={15} className="text-gray-400" />
                      </Link>
                      <button
                        onClick={() => setConfirmDelete({ id: product.id, name: product.name })}
                        disabled={deletingId === product.id}
                        className="p-2.5 rounded-xl border border-red-500/20 hover:bg-red-500/10 transition-all disabled:opacity-50">
                        {deletingId === product.id
                          ? <RefreshCw size={15} className="text-red-400 animate-spin" />
                          : <Trash2 size={15} className="text-red-400" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CCTV Cameras ─────────────────────────────────────────── */}
        {activeTab === 'cameras' && <CamerasTab />}

        {/* ── Analytics ────────────────────────────────────────────── */}
        {activeTab === 'analytics' && <AnalyticsTab />}

        {/* ── Inventory Sync ───────────────────────────────────────── */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#00AFCA]/20 bg-gradient-to-r from-[#00AFCA]/5 to-transparent p-6">
              <div className="flex items-center gap-3 mb-2">
                <Sliders size={22} className="text-[#00AFCA]" />
                <h2 className="text-lg font-bold text-white">Dual-Inventory синхрондау</h2>
              </div>
              <p className="text-gray-400 text-sm">Розница (B2C) және экспорт (B2B) арасында бөліңіз.</p>
            </div>
            {products.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border border-dashed border-white/10">
                <Package size={44} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">Өнімдер жоқ</p>
              </div>
            ) : (
              products.map((product) => {
                const s = inventorySliders[product.id];
                if (!s) return null;
                const retailPct = s.total > 0 ? Math.round((s.retail / s.total) * 100) : 50;
                return (
                  <div key={product.id} className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-6">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">🥩</div>}
                      </div>
                      <div>
                        <p className="font-bold text-white">{product.name}</p>
                        <p className="text-sm text-gray-500">Барлығы: <span className="text-white font-semibold">{s.total} кг</span></p>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#00AFCA] font-semibold">🛒 Розница: {s.retail} кг ({retailPct}%)</span>
                      <span className="text-blue-400 font-semibold">🚢 Экспорт: {s.export_} кг ({100 - retailPct}%)</span>
                    </div>
                    <div className="relative h-3 bg-white/5 rounded-full overflow-hidden mb-3">
                      <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00AFCA] to-[#0089A7] transition-all duration-200" style={{ width: `${retailPct}%` }} />
                    </div>
                    <input type="range" min={0} max={s.total} value={s.retail}
                      onChange={(e) => handleSliderChange(product.id, +e.target.value)}
                      className="w-full accent-[#00AFCA] cursor-pointer mb-4" disabled={s.total === 0} />
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-[#00AFCA]/8 rounded-xl p-3 text-center">
                        <p className="text-[#00AFCA] font-black text-lg">{s.retail} кг</p>
                        <p className="text-gray-400 text-xs">Розница · {formatPrice(product.retailPrice)} ₸/кг</p>
                      </div>
                      <div className="bg-blue-500/8 rounded-xl p-3 text-center">
                        <p className="text-blue-400 font-black text-lg">{s.export_} кг</p>
                        <p className="text-gray-400 text-xs">Экспорт · {formatPrice(product.exportPrice ?? product.wholesalePrice)} ₸/кг</p>
                      </div>
                    </div>
                    <button onClick={() => saveInventory(product.id)} disabled={s.saving}
                      className="w-full flex items-center justify-center gap-2 py-3 font-bold text-[#0A2540] rounded-xl disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg,#C9A227,#FFD700)' }}>
                      {s.saving ? <><RefreshCw size={16} className="animate-spin" /> Сақталуда...</> : <>Сақтау <ChevronRight size={16} /></>}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Orders ───────────────────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-20 rounded-2xl border border-dashed border-white/10">
                <ShoppingBag size={44} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">Заказов пока нет</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-5">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <p className="font-bold text-white">Заказ #{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                      {order.deliveryCity && (
                        <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                          <MapPin size={12} className="text-[#00AFCA]" /> {order.deliveryCity}
                          {order.deliveryAddress && `, ${order.deliveryAddress}`}
                        </p>
                      )}
                      <p className="text-sm font-bold text-[#C9A227] mt-1">{formatPrice(order.totalAmount)} ₸</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${STATUS_COLOR[order.status] ?? 'bg-gray-500/15 text-gray-400'}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                      {order.status === 'PENDING' && (
                        <button onClick={() => handleStatusUpdate(order.id, 'CONFIRMED')}
                          className="text-sm px-4 py-1.5 rounded-xl font-bold text-[#0A2540]"
                          style={{ background: 'linear-gradient(135deg,#C9A227,#FFD700)' }}>
                          Подтвердить
                        </button>
                      )}
                      {order.status === 'CONFIRMED' && (
                        <button onClick={() => handleStatusUpdate(order.id, 'SHIPPED')}
                          className="text-sm px-4 py-1.5 rounded-xl font-bold bg-[#00AFCA] text-white">
                          Отправить
                        </button>
                      )}
                      {order.status === 'SHIPPED' && (
                        <button onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                          className="text-sm px-4 py-1.5 rounded-xl font-bold bg-green-600 text-white">
                          Доставлен
                        </button>
                      )}
                    </div>
                  </div>
                  {order.items?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/6 space-y-1">
                      {order.items.map((item) => (
                        <p key={item.id} className="text-sm text-gray-400">
                          • {item.product?.name || 'Продукт'}: {item.quantity} кг × {formatPrice(item.price)} ₸
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Delete confirmation modal ─────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="rounded-2xl border border-white/10 bg-[#0A1929] max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">Өнімді жою</h3>
                <p className="text-xs text-gray-500">Бұл әрекетті кері қайтару мүмкін емес</p>
              </div>
              <button onClick={() => setConfirmDelete(null)} className="ml-auto p-1.5 rounded-lg hover:bg-white/10"><X size={16} className="text-gray-400" /></button>
            </div>
            <p className="text-gray-300 mb-6 text-sm">
              <span className="font-semibold text-white">«{confirmDelete.name}»</span> өнімін шынымен жойғыңыз келе ме?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 font-semibold hover:bg-white/5 transition-all">
                Болдырмау
              </button>
              <button onClick={confirmDeleteProduct}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all">
                Жою
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
