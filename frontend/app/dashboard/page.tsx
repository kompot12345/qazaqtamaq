'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import {
  Plus, Package, TrendingUp, ShoppingBag, Edit, Trash2,
  BarChart3, Star, AlertTriangle, RefreshCw, Sliders, ChevronRight
} from 'lucide-react';
import { productsAPI, ordersAPI } from '@/lib/api';
import { formatPrice, formatDate, getOrderStatusLabel, getOrderStatusColor, getStoredUser } from '@/lib/utils';
import type { Product, Order } from '@/types';

const FarmerCanvas = dynamic(() => import('@/components/three/FarmerCanvas'), {
  ssr: false,
  loading: () => <div className="w-full h-full" />,
});

interface InventorySlider {
  productId: string;
  total: number;
  retail: number;
  export_: number;
  saving: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'inventory'>('overview');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [inventorySliders, setInventorySliders] = useState<Record<string, InventorySlider>>({});

  const user = getStoredUser();

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (user.role !== 'FARMER' && user.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    const load = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          productsAPI.getFarmerProducts(),
          ordersAPI.getFarmerOrders().catch(() => ({ data: [] })),
        ]);
        setProducts(productsRes.data?.data || productsRes.data || []);
        setOrders(ordersRes.data?.data || ordersRes.data || []);
      } catch {
        toast.error('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const initSliders = useCallback((prods: Product[]) => {
    const sliders: Record<string, InventorySlider> = {};
    prods.forEach((p) => {
      sliders[p.id] = {
        productId: p.id,
        total: p.retailStock + p.exportStock,
        retail: p.retailStock,
        export_: p.exportStock,
        saving: false,
      };
    });
    setInventorySliders(sliders);
  }, []);

  useEffect(() => {
    if (products.length > 0) initSliders(products);
  }, [products, initSliders]);

  const handleSliderChange = (productId: string, retailValue: number) => {
    setInventorySliders((prev) => {
      const s = prev[productId];
      if (!s) return prev;
      const exportVal = s.total - retailValue;
      return { ...prev, [productId]: { ...s, retail: retailValue, export_: exportVal } };
    });
  };

  const saveInventory = async (productId: string) => {
    const s = inventorySliders[productId];
    if (!s) return;
    setInventorySliders((prev) => ({ ...prev, [productId]: { ...s, saving: true } }));
    try {
      await productsAPI.syncInventory(productId, s.retail, s.export_);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, retailStock: s.retail, exportStock: s.export_ } : p,
        ),
      );
      toast.success('Запасы синхронизированы!');
    } catch {
      toast.error('Ошибка синхронизации');
    } finally {
      setInventorySliders((prev) => ({ ...prev, [productId]: { ...prev[productId], saving: false } }));
    }
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmDelete({ id, name });
  };

  const confirmDeleteProduct = async () => {
    if (!confirmDelete) return;
    const { id } = confirmDelete;
    setConfirmDelete(null);
    setDeletingId(id);
    try {
      await productsAPI.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Продукт удален');
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
      toast.success('Статус обновлен');
    } catch {
      toast.error('Ошибка обновления статуса');
    }
  };

  const totalRevenue = orders
    .filter((o) => o.status === 'DELIVERED')
    .reduce((s, o) => s + o.totalAmount, 0);

  const lowStockProducts = products.filter((p) => p.retailStock < 10);
  const expiringProducts = products.filter((p) => (p.daysUntilExpiry ?? 99) <= 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-sky-50/30">
        <div className="bg-gradient-to-br from-[#0A2540] to-[#0D3256] py-14">
          <div className="container-custom">
            <div className="h-10 w-64 bg-white/20 rounded animate-pulse mb-2" />
          </div>
        </div>
        <div className="container-custom py-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse shimmer" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-sky-50/30">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#060D1A] via-[#0A2540] to-[#0D3256] overflow-hidden relative">
        {/* Subtle grain overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'200\' height=\'200\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")' }}
        />

        <div className="container-custom py-10 relative z-10">
          <div className="flex items-end justify-between gap-6 flex-wrap">

            {/* Left: text */}
            <div className="flex-1 min-w-0 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #C9A227, #FFD700)' }}>
                  <BarChart3 size={18} className="text-[#0A2540]" />
                </div>
                <span className="text-[#FFD700] text-xs font-bold tracking-widest uppercase">Фермер кабинеті</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                Сәлем, <span style={{ color: '#FFD700' }}>{user?.name}</span>!
              </h1>
              <p className="text-gray-400 mt-2 text-sm max-w-sm">
                Бүгін де табысты жұмыс күні! Өнімдеріңізді басқарып, тапсырыстарды қадағалаңыз.
              </p>
              <div className="flex items-center gap-3 mt-5 flex-wrap">
                <Link href="/dashboard/products/new"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #C9A227, #FFD700)', color: '#0A2540' }}>
                  <Plus size={16} /> Өнім қосу
                </Link>
                <Link href="/products"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border border-white/20 text-white hover:bg-white/10 transition-all">
                  Дүкенге өту →
                </Link>
              </div>
            </div>

            {/* Right: 3D Erlan character */}
            <div className="hidden lg:flex items-end gap-4 flex-shrink-0">
              {/* Speech bubble above character */}
              <div className="flex flex-col items-center">
                <div className="relative mb-1">
                  <div className="bg-white/10 backdrop-blur-sm border border-[#FFD700]/30 rounded-2xl rounded-br-none px-4 py-2.5 shadow-xl">
                    <p className="text-white text-xs font-semibold leading-relaxed max-w-[160px]">
                      Жаңа тапсырыстар<br />
                      <span className="text-[#FFD700]">сізді күтуде! 🌾</span>
                    </p>
                  </div>
                  {/* Triangle pointer */}
                  <div className="absolute -bottom-2 right-3 w-0 h-0"
                    style={{ borderLeft: '8px solid transparent', borderTop: '8px solid rgba(255,215,0,0.3)' }} />
                </div>

                {/* Erlan 3D character */}
                <div className="w-[160px] h-[260px]">
                  <FarmerCanvas gender="male" waving cameraY={1.05} cameraZ={3.2} />
                </div>
              </div>

              {/* Decorative stats card next to character */}
              <div className="mb-6 space-y-2">
                {[
                  { label: 'Өнімдер', value: products.length, color: '#00AFCA' },
                  { label: 'Тапсырыстар', value: orders.length, color: '#FFD700' },
                ].map((item) => (
                  <div key={item.label}
                    className="bg-white/8 backdrop-blur border border-white/10 rounded-xl px-4 py-2.5 text-center min-w-[90px]">
                    <p className="text-xl font-black" style={{ color: item.color }}>{item.value}</p>
                    <p className="text-white/60 text-xs">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Gold bottom line */}
        <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }} />
      </div>

      <div className="container-custom py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Продуктов', value: products.length, icon: Package, color: 'from-[#00AFCA] to-[#0089A7]', textDark: false },
            { label: 'Заказов', value: orders.length, icon: ShoppingBag, color: 'from-blue-500 to-blue-600', textDark: false },
            { label: 'Выручка (₸)', value: formatPrice(totalRevenue), icon: TrendingUp, color: 'from-[#D4AF37] to-[#E8C547]', textDark: true },
            { label: 'Ср. рейтинг', value: '4.8 ★', icon: Star, color: 'from-purple-500 to-purple-600', textDark: false },
          ].map((stat) => (
            <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 text-white shadow-lg`}>
              <stat.icon size={24} className={`mb-3 ${stat.textDark ? 'text-[#0A2540]' : 'text-white/80'}`} />
              <p className={`text-2xl font-bold mb-1 ${stat.textDark ? 'text-[#0A2540]' : ''}`}>{stat.value}</p>
              <p className={`text-sm ${stat.textDark ? 'text-[#0A2540]/70' : 'text-white/70'}`}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {(lowStockProducts.length > 0 || expiringProducts.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {lowStockProducts.length > 0 && (
              <div className="flex gap-3 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
                <AlertTriangle size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-orange-800">Низкий запас</p>
                  <p className="text-sm text-orange-700">{lowStockProducts.map((p) => p.name).join(', ')} — менее 10 кг</p>
                </div>
              </div>
            )}
            {expiringProducts.length > 0 && (
              <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-800">Истекает срок годности</p>
                  <p className="text-sm text-red-700">{expiringProducts.map((p) => `${p.name} (${p.daysUntilExpiry} дн.)`).join(', ')}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 max-w-2xl">
          {[
            { key: 'overview', label: 'Обзор' },
            { key: 'products', label: 'Продукты' },
            { key: 'orders', label: 'Заказы' },
            { key: 'inventory', label: '⚖️ Запасы' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === tab.key ? 'bg-white text-[#0A2540] shadow-sm' : 'text-gray-600 hover:text-[#0A2540]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 slide-up">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#0A2540] text-lg">Последние продукты</h3>
                <button onClick={() => setActiveTab('products')} className="text-sm text-[#D4AF37] font-semibold hover:underline">Все →</button>
              </div>
              {products.slice(0, 4).map((product) => (
                <div key={product.id} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                  <div className="w-10 h-10 bg-sky-50 rounded-lg overflow-hidden flex-shrink-0">
                    {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">🥩</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#0A2540] truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.retailStock} кг на складе</p>
                  </div>
                  <p className="text-sm font-bold text-[#0A2540]">{formatPrice(product.retailPrice)} ₸</p>
                </div>
              ))}
              {products.length === 0 && <p className="text-center text-gray-400 py-8">Нет продуктов</p>}
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#0A2540] text-lg">Последние заказы</h3>
                <button onClick={() => setActiveTab('orders')} className="text-sm text-[#D4AF37] font-semibold hover:underline">Все →</button>
              </div>
              {orders.slice(0, 4).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-semibold text-sm text-[#0A2540]">#{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#0A2540]">{formatPrice(order.totalAmount)} ₸</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getOrderStatusColor(order.status)}`}>{getOrderStatusLabel(order.status)}</span>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <p className="text-center text-gray-400 py-8">Нет заказов</p>}
            </div>
          </div>
        )}

        {/* Products tab */}
        {activeTab === 'products' && (
          <div className="slide-up">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600 font-medium">{products.length} продуктов</p>
              <Link href="/dashboard/products/new" className="btn-primary flex items-center gap-2"><Plus size={16} /> Новый продукт</Link>
            </div>
            {products.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-3xl">
                <Package size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">У вас нет продуктов</p>
                <Link href="/dashboard/products/new" className="btn-primary">Добавить первый продукт</Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {products.map((product) => (
                  <div key={product.id} className="card p-5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-sky-50 flex-shrink-0">
                      {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🥩</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#0A2540]">{product.name}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-sm text-gray-500">Розница: {formatPrice(product.retailPrice)} ₸</span>
                        <span className="text-sm text-gray-500">Запас: {product.retailStock} кг</span>
                        {product.discountActive && <span className="badge-warning text-xs">Скидка 30%</span>}
                        {product.retailStock < 10 && <span className="text-xs text-orange-600 font-semibold">⚠ Мало на складе</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/products/${product.id}/edit`} className="p-2.5 border border-gray-200 rounded-lg hover:bg-sky-50 transition-all"><Edit size={16} className="text-gray-600" /></Link>
                      <button onClick={() => handleDelete(product.id, product.name)} disabled={deletingId === product.id} className="p-2.5 border border-red-200 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50">
                        {deletingId === product.id ? <RefreshCw size={16} className="text-red-500 animate-spin" /> : <Trash2 size={16} className="text-red-500" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inventory Sync tab */}
        {activeTab === 'inventory' && (
          <div className="slide-up space-y-4">
            <div className="bg-gradient-to-r from-[#0A2540] to-[#0D3256] rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Sliders size={24} />
                <h2 className="text-xl font-bold">Dual-Inventory синхрондау</h2>
              </div>
              <p className="text-gray-300 text-sm">
                Әр өнімнің жалпы қорын розница (B2C) және экспорт (B2B) арасында бөліңіз.
                Слайдерді жылжытып «Сақтау» батырмасын басыңыз.
              </p>
            </div>
            {products.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-3xl">
                <Package size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Өнімдер жоқ</p>
              </div>
            ) : (
              products.map((product) => {
                const s = inventorySliders[product.id];
                if (!s) return null;
                const retailPct = s.total > 0 ? Math.round((s.retail / s.total) * 100) : 50;
                return (
                  <div key={product.id} className="card p-6">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-sky-50 flex-shrink-0">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">🥩</div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-[#0A2540]">{product.name}</p>
                        <p className="text-sm text-gray-500">Барлығы: <span className="font-semibold text-[#0A2540]">{s.total} кг</span></p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="flex items-center gap-1 font-semibold text-green-700">
                          🛒 Розница: {s.retail} кг ({retailPct}%)
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-blue-700">
                          🚢 Экспорт: {s.export_} кг ({100 - retailPct}%)
                        </span>
                      </div>

                      {/* Visual bar */}
                      <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden mb-3">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00AFCA] to-[#0089A7] transition-all duration-200"
                          style={{ width: `${retailPct}%` }}
                        />
                        <div
                          className="absolute inset-y-0 right-0 bg-gradient-to-l from-blue-500 to-blue-400 transition-all duration-200"
                          style={{ width: `${100 - retailPct}%` }}
                        />
                      </div>

                      <input
                        type="range"
                        min={0}
                        max={s.total}
                        value={s.retail}
                        onChange={(e) => handleSliderChange(product.id, +e.target.value)}
                        className="w-full accent-[#0089A7] cursor-pointer"
                        disabled={s.total === 0}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="bg-sky-50 rounded-xl p-3 text-center">
                        <p className="text-sky-700 font-bold text-lg">{s.retail} кг</p>
                        <p className="text-sky-600">Розница</p>
                        <p className="text-xs text-gray-500">{formatPrice(product.retailPrice)} ₸/кг</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-3 text-center">
                        <p className="text-blue-700 font-bold text-lg">{s.export_} кг</p>
                        <p className="text-blue-600">Экспорт</p>
                        <p className="text-xs text-gray-500">{formatPrice(product.exportPrice ?? product.wholesalePrice)} ₸/кг</p>
                      </div>
                    </div>

                    <button
                      onClick={() => saveInventory(product.id)}
                      disabled={s.saving}
                      className="w-full btn-primary flex items-center justify-center gap-2 py-2.5"
                    >
                      {s.saving ? (
                        <><RefreshCw size={16} className="animate-spin" /> Сақталуда...</>
                      ) : (
                        <>Сақтау <ChevronRight size={16} /></>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Orders tab */}
        {activeTab === 'orders' && (
          <div className="slide-up space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-3xl">
                <ShoppingBag size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Заказов пока нет</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="card p-5">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <p className="font-bold text-[#0A2540]">Заказ #{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                      <p className="text-sm font-semibold text-[#0A2540] mt-1">{formatPrice(order.totalAmount)} ₸</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${getOrderStatusColor(order.status)}`}>{getOrderStatusLabel(order.status)}</span>
                      {order.status === 'PENDING' && (
                        <button onClick={() => handleStatusUpdate(order.id, 'CONFIRMED')} className="text-sm btn-primary py-1.5">Подтвердить</button>
                      )}
                      {order.status === 'CONFIRMED' && (
                        <button onClick={() => handleStatusUpdate(order.id, 'SHIPPED')} className="text-sm btn-primary py-1.5">Отправить</button>
                      )}
                      {order.status === 'SHIPPED' && (
                        <button onClick={() => handleStatusUpdate(order.id, 'DELIVERED')} className="text-sm btn-accent py-1.5">Доставлен</button>
                      )}
                    </div>
                  </div>
                  {order.items?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {order.items.map((item) => (
                        <p key={item.id} className="text-sm text-gray-600">• {item.product?.name || 'Продукт'}: {item.quantity} кг × {formatPrice(item.price)} ₸</p>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-[#0A2540] text-lg">Өнімді жою</h3>
                <p className="text-sm text-gray-500">Бұл әрекетті кері қайтару мүмкін емес</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              <span className="font-semibold">«{confirmDelete.name}»</span> өнімін шынымен жойғыңыз келе ме?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
              >
                Болдырмау
              </button>
              <button
                onClick={confirmDeleteProduct}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all"
              >
                Жою
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
