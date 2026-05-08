'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Package, ChevronDown, ChevronUp, ArrowLeft, ShoppingBag } from 'lucide-react';
import { ordersAPI } from '@/lib/api';
import { formatPrice, formatDate, getOrderStatusLabel, getOrderStatusColor, getStoredUser } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Order } from '@/types';

export default function OrdersPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) { router.push('/auth/login'); return; }
    ordersAPI.getMy()
      .then((res) => setOrders(res.data?.data || res.data || []))
      .catch(() => toast.error(t('orders.loadError')))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-sky-50/30">
        <div className="bg-gradient-to-br from-[#0A2540] to-[#0D3256] py-14">
          <div className="container-custom"><div className="h-10 w-48 bg-white/20 rounded animate-pulse" /></div>
        </div>
        <div className="container-custom py-10 space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse shimmer" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-sky-50/30">
      <div className="bg-gradient-to-br from-[#0A2540] to-[#0D3256] py-14">
        <div className="container-custom">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors">
            <ArrowLeft size={18} /> {t('orders.backToHome')}
          </Link>
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <ShoppingBag size={40} /> {t('orders.title')}
          </h1>
          <p className="text-gray-300 mt-2">{orders.length} {t('orders.title').toLowerCase()}</p>
        </div>
      </div>

      <div className="container-custom py-10">
        {orders.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={40} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-3">{t('orders.empty')}</h2>
            <p className="text-gray-500 mb-8">{t('orders.emptySubtitle')}</p>
            <Link href="/products" className="btn-primary">{t('orders.goToCatalogue')}</Link>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl">
            {orders.map((order) => (
              <div key={order.id} className="card overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-sky-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#0A2540]/10 to-[#FFD700]/10 rounded-xl flex items-center justify-center">
                      <Package size={22} className="text-[#0A2540]" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[#0A2540]">{t('orders.order')} #{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-[#0A2540]">{formatPrice(order.totalAmount)} ₸</p>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </div>
                    {expanded === order.id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                  </div>
                </button>

                {expanded === order.id && (
                  <div className="border-t border-gray-100 px-6 py-4 bg-sky-50/30 slide-up">
                    <div className="flex flex-wrap gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${order.type === 'EXPORT' ? 'bg-blue-100 text-blue-800' : 'bg-sky-100 text-sky-800'}`}>
                        {order.type === 'EXPORT' ? t('orders.export') : t('orders.retail')}
                      </span>
                      {(order as any).deliveryCity && (
                        <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 flex items-center gap-1">
                          📍 {(order as any).deliveryCity}
                        </span>
                      )}
                    </div>
                    {((order as any).deliveryAddress || (order as any).phone) && (
                      <div className="bg-white border border-gray-100 rounded-xl p-3 mb-4 text-sm space-y-1">
                        {(order as any).deliveryAddress && (
                          <p className="text-gray-600"><span className="font-semibold text-[#0A2540]">{t('orders.address')}:</span> {(order as any).deliveryAddress}</p>
                        )}
                        {(order as any).phone && (
                          <p className="text-gray-600"><span className="font-semibold text-[#0A2540]">{t('orders.phone')}:</span> {(order as any).phone}</p>
                        )}
                      </div>
                    )}
                    <div className="space-y-3">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-100">
                          <div className="w-12 h-12 bg-sky-50 rounded-lg overflow-hidden flex-shrink-0">
                            {item.product?.imageUrl
                              ? <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-xl">🥩</div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[#0A2540] truncate">{item.product?.name || t('orders.product')}</p>
                            <p className="text-sm text-gray-500">{item.quantity} кг × {formatPrice(item.price)} ₸</p>
                          </div>
                          <p className="font-bold text-[#0A2540] flex-shrink-0">{formatPrice(item.price * item.quantity)} ₸</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                      <span className="font-bold text-[#0A2540]">{t('orders.itemTotal')}</span>
                      <span className="text-xl font-bold text-[#0A2540]">{formatPrice(order.totalAmount)} ₸</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
