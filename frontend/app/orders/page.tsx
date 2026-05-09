'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Package, ChevronDown, ChevronUp, ArrowLeft, ShoppingBag,
  Globe, MapPin, Phone, Calendar, Tag,
} from 'lucide-react';
import { ordersAPI } from '@/lib/api';
import { formatPrice, formatDate, getOrderStatusLabel, getStoredUser } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Order } from '@/types';

const STATUS_COLOR_DARK: Record<string, string> = {
  PENDING:   'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  CONFIRMED: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
  SHIPPED:   'bg-[#00AFCA]/15 text-[#7DD8E8] border border-[#00AFCA]/30',
  DELIVERED: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  CANCELLED: 'bg-red-500/15 text-red-400 border border-red-500/30',
};

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
      <div className="min-h-screen bg-[#060D1A]">
        <div className="bg-gradient-to-br from-[#0A2540] to-[#0D3256] py-14">
          <div className="container-custom"><div className="h-10 w-48 bg-white/20 rounded animate-pulse" /></div>
        </div>
        <div className="container-custom py-10 space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-white/[0.04] rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060D1A]">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0A2540] via-[#0D3256] to-[#060D1A] py-14">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#C9A227]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="container-custom relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-5 transition-colors text-sm">
            <ArrowLeft size={16} /> {t('orders.backToHome')}
          </Link>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[#C9A227] text-[10px] font-black tracking-[0.2em] mb-3">MY ACCOUNT</p>
              <h1 className="text-4xl font-black text-white flex items-center gap-3 tracking-tight">
                <ShoppingBag size={36} className="text-[#C9A227]" />
                {t('orders.title')}
              </h1>
              <p className="text-gray-500 mt-2 text-sm">{orders.length} {t('orders.title').toLowerCase()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-10">
        {orders.length === 0 ? (
          <div className="text-center py-24 border border-white/6 rounded-3xl bg-white/[0.02]">
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Package size={36} className="text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">{t('orders.empty')}</h2>
            <p className="text-gray-500 mb-8">{t('orders.emptySubtitle')}</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 font-bold text-[#0A2540] rounded-xl transition-all hover:shadow-[0_0_20px_rgba(201,162,39,0.4)] hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #C9A227, #FFD700)' }}
            >
              {t('orders.goToCatalogue')}
            </Link>
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.06] to-white/[0.02] overflow-hidden hover:border-white/14 transition-all duration-300"
              >
                {/* Order header row */}
                <button
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  className="w-full p-5 flex items-center justify-between hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-[#C9A227]/12 border border-[#C9A227]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package size={20} className="text-[#C9A227]" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-white text-sm">
                        {t('orders.order')} <span className="text-[#00AFCA]">#{order.id.slice(-8).toUpperCase()}</span>
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Calendar size={10} /> {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-black text-white text-base">{formatPrice(order.totalAmount)} ₸</p>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${STATUS_COLOR_DARK[order.status] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </div>
                    {expanded === order.id
                      ? <ChevronUp size={18} className="text-gray-500 flex-shrink-0" />
                      : <ChevronDown size={18} className="text-gray-500 flex-shrink-0" />}
                  </div>
                </button>

                {/* Expanded content */}
                {expanded === order.id && (
                  <div className="border-t border-white/8 px-5 py-4 space-y-4 slide-up">
                    {/* Tags row */}
                    <div className="flex flex-wrap gap-2">
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                        order.type === 'EXPORT'
                          ? 'bg-blue-500/12 text-blue-300 border-blue-500/25'
                          : 'bg-[#00AFCA]/12 text-[#7DD8E8] border-[#00AFCA]/25'
                      }`}>
                        <Tag size={10} /> {order.type === 'EXPORT' ? t('orders.export') : t('orders.retail')}
                      </span>
                      {(order as any).deliveryCity && (
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-white/8 text-gray-300 border border-white/10">
                          <MapPin size={10} /> {(order as any).deliveryCity}
                        </span>
                      )}
                    </div>

                    {/* Delivery details */}
                    {((order as any).deliveryAddress || (order as any).phone) && (
                      <div className="bg-white/[0.04] border border-white/8 rounded-xl p-3 text-sm space-y-1">
                        {(order as any).deliveryAddress && (
                          <p className="text-gray-400">
                            <span className="font-semibold text-gray-300">{t('orders.address')}:</span>{' '}
                            {(order as any).deliveryAddress}
                          </p>
                        )}
                        {(order as any).phone && (
                          <p className="text-gray-400 flex items-center gap-1.5">
                            <Phone size={11} className="text-gray-500" />
                            <span className="font-semibold text-gray-300">{t('orders.phone')}:</span>{' '}
                            {(order as any).phone}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Items */}
                    <div className="space-y-2">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/6 rounded-xl">
                          <div className="w-11 h-11 bg-white/8 rounded-lg overflow-hidden flex-shrink-0">
                            {item.product?.imageUrl
                              ? <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-lg">🥩</div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white text-sm truncate">{item.product?.name || t('orders.product')}</p>
                            <p className="text-xs text-gray-500">{item.quantity} кг × {formatPrice(item.price)} ₸</p>
                          </div>
                          <p className="font-bold text-white flex-shrink-0">{formatPrice(item.price * item.quantity)} ₸</p>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-white/8 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider">{t('orders.itemTotal')}</p>
                        <p className="text-xl font-black text-white">{formatPrice(order.totalAmount)} ₸</p>
                      </div>
                      {order.status !== 'CANCELLED' && (
                        <Link
                          href={`/orders/${order.id}/tracking`}
                          className="flex items-center gap-1.5 px-4 py-2 font-bold text-[#0A2540] text-xs rounded-xl transition-all hover:shadow-[0_0_20px_rgba(201,162,39,0.4)] hover:scale-[1.03] active:scale-95"
                          style={{ background: 'linear-gradient(135deg, #C9A227, #FFD700)' }}
                        >
                          <Globe size={13} />
                          {t('orders.track')}
                        </Link>
                      )}
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
