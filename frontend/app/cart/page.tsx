'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ArrowRight,
  Package, X, MapPin, Phone, User,
} from 'lucide-react';
import { ordersAPI, productsAPI } from '@/lib/api';
import { formatPrice, getStoredUser, getStoredCart, saveCart } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { CartItem } from '@/types';

interface DeliveryForm {
  name: string;
  phone: string;
  city: string;
  address: string;
}

export default function CartPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const user = getStoredUser();

  const [delivery, setDelivery] = useState<DeliveryForm>({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    city: user?.city ?? '',
    address: '',
  });

  useEffect(() => {
    const stored = getStoredCart();
    if (stored.length === 0) { setCart([]); return; }

    Promise.all(
      stored.map((item: CartItem) =>
        productsAPI.getById(item.productId)
          .then((res) => ({ ...item, retailStock: (res.data as { retailStock: number }).retailStock }))
          .catch(() => null),
      ),
    ).then((results) => {
      const valid = results.filter(Boolean) as CartItem[];
      const dropped = stored.length - valid.length;
      if (dropped > 0) {
        toast.error(`${dropped} ${t('cart.itemRemoved')}`);
        saveCart(valid);
      }
      setCart(valid);
    });

    const onCartUpdate = () => setCart(getStoredCart());
    window.addEventListener('cartUpdated', onCartUpdate);
    return () => window.removeEventListener('cartUpdated', onCartUpdate);
  }, []);

  const updateQty = (productId: string, delta: number) => {
    const updated = cart
      .map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(0, Math.min(item.retailStock, item.quantity + delta)) }
          : item,
      )
      .filter((item) => item.quantity > 0);
    setCart(updated);
    saveCart(updated);
  };

  const removeItem = (productId: string) => {
    const updated = cart.filter((i) => i.productId !== productId);
    setCart(updated);
    saveCart(updated);
    toast.success(t('cart.itemRemoved'));
  };

  const clearCart = () => {
    setCart([]);
    saveCart([]);
    toast.success(t('cart.cartCleared'));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const openCheckout = () => {
    if (!user) {
      toast.error(t('cart.loginRequired'));
      router.push('/auth/login');
      return;
    }
    if (cart.length === 0) return;
    setShowModal(true);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delivery.phone.trim() || !delivery.city.trim() || !delivery.address.trim()) {
      toast.error(t('cart.fillDelivery'));
      return;
    }

    setLoading(true);
    try {
      const res = await ordersAPI.create({
        type: user!.role === 'B2B_BUYER' ? 'EXPORT' : 'RETAIL',
        totalAmount: total,
        deliveryAddress: delivery.address.trim(),
        deliveryCity: delivery.city.trim(),
        phone: delivery.phone.trim(),
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      });
      const orderId: string = (res.data as { id: string }).id;
      saveCart([]);
      setCart([]);
      setShowModal(false);
      toast.success(`${t('orders.order')} #${orderId.slice(-6).toUpperCase()} ✓`);
      router.push('/orders');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : (msg || t('cart.orderError')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060D1A]">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0A2540] via-[#0D3256] to-[#060D1A] py-14">
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-[#00AFCA]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="container-custom relative z-10">
          <Link href="/products" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-5 transition-colors text-sm">
            <ArrowLeft size={16} /> {t('cart.continueShopping')}
          </Link>
          <p className="text-[#C9A227] text-[10px] font-black tracking-[0.2em] mb-3">MY ACCOUNT</p>
          <h1 className="text-4xl font-black text-white flex items-center gap-3 tracking-tight">
            <ShoppingCart size={36} className="text-[#C9A227]" />
            {t('cart.title')}
            {cart.length > 0 && (
              <span className="text-2xl text-[#C9A227]">({cart.length})</span>
            )}
          </h1>
        </div>
      </div>

      <div className="container-custom py-10">
        {cart.length === 0 ? (
          <div className="text-center py-24 border border-white/6 rounded-3xl bg-white/[0.02]">
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShoppingCart size={36} className="text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">{t('cart.empty')}</h2>
            <p className="text-gray-500 mb-8">{t('cart.emptySubtitle')}</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 font-bold text-[#0A2540] rounded-xl transition-all hover:shadow-[0_0_20px_rgba(201,162,39,0.4)] hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #C9A227, #FFD700)' }}
            >
              <Package size={18} /> {t('cart.goToCatalogue')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm font-medium">{cart.length} {t('nav.products').toLowerCase()}</p>
                <button
                  onClick={clearCart}
                  className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors font-medium"
                >
                  <Trash2 size={13} /> {t('cart.clearCart')}
                </button>
              </div>

              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 items-center p-4 rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.06] to-white/[0.02] hover:border-white/14 transition-all duration-200"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white/8 border border-white/10">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🥩</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">{item.name}</h3>
                    <p className="text-sm text-gray-500">{formatPrice(item.price)} ₸/кг</p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center border border-white/10 bg-white/5 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQty(item.productId, -1)}
                        className="w-8 h-9 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/8 transition-all"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center font-bold text-white text-sm border-x border-white/10">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.productId, 1)}
                        disabled={item.quantity >= item.retailStock}
                        className="w-8 h-9 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/8 transition-all disabled:opacity-30"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <p className="font-bold text-white w-24 text-right text-sm">
                      {formatPrice(item.price * item.quantity)} ₸
                    </p>

                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-2 hover:bg-red-500/12 rounded-lg transition-colors text-gray-600 hover:text-red-400"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 sticky top-24">
                <h2 className="text-lg font-bold text-white mb-5">{t('cart.orderSummary')}</h2>

                <div className="space-y-2.5 mb-5">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span className="text-gray-500 truncate flex-1 mr-2">{item.name} × {item.quantity}</span>
                      <span className="font-medium text-gray-300 flex-shrink-0">{formatPrice(item.price * item.quantity)} ₸</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4 mb-5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{t('cart.total')}</span>
                    <span className="text-2xl font-black text-white">{formatPrice(total)} ₸</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{t('cart.excludingDelivery')}</p>
                </div>

                <button
                  onClick={openCheckout}
                  disabled={cart.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-3.5 font-bold text-[#0A2540] rounded-xl transition-all hover:shadow-[0_0_24px_rgba(201,162,39,0.4)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  style={{ background: 'linear-gradient(135deg, #C9A227, #FFD700)' }}
                >
                  {t('cart.placeOrder')} <ArrowRight size={17} />
                </button>

                {!user && (
                  <p className="text-center text-xs text-gray-600 mt-3">
                    <Link href="/auth/login" className="text-[#00AFCA] font-semibold hover:underline">
                      {t('cart.loginToOrder')}
                    </Link>{' '}
                    {t('cart.loginToOrderSuffix')}
                  </p>
                )}

                <div className="mt-5 space-y-2 pt-4 border-t border-white/8">
                  <p className="text-xs text-gray-600">{t('cart.securePayment')}</p>
                  <p className="text-xs text-gray-600">{t('cart.deliveryKz')}</p>
                  <p className="text-xs text-gray-600">{t('cart.qualityGuarantee')}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delivery modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden border border-white/12 bg-[#0A1929] shadow-[0_32px_80px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/8">
              <div>
                <h2 className="text-xl font-bold text-white">{t('cart.deliveryTitle')}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{t('cart.deliverySubtitle')}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/8 rounded-xl transition-colors text-gray-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="px-6 py-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  {t('auth.fullName')}
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    value={delivery.name}
                    onChange={(e) => setDelivery((d) => ({ ...d, name: e.target.value }))}
                    placeholder={t('cart.namePlaceholder')}
                    className="w-full pl-10 pr-4 py-3 bg-white/6 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#00AFCA]/50 focus:bg-white/8 transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  {t('cart.phoneRequired')}
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    required
                    value={delivery.phone}
                    onChange={(e) => setDelivery((d) => ({ ...d, phone: e.target.value }))}
                    placeholder="+7 700 000 0000"
                    className="w-full pl-10 pr-4 py-3 bg-white/6 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#00AFCA]/50 focus:bg-white/8 transition-all"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  {t('cart.cityRequired')}
                </label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    required
                    value={delivery.city}
                    onChange={(e) => setDelivery((d) => ({ ...d, city: e.target.value }))}
                    placeholder="Алматы"
                    className="w-full pl-10 pr-4 py-3 bg-white/6 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#00AFCA]/50 focus:bg-white/8 transition-all"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                  {t('cart.deliveryAddress')}
                </label>
                <textarea
                  required
                  rows={2}
                  value={delivery.address}
                  onChange={(e) => setDelivery((d) => ({ ...d, address: e.target.value }))}
                  placeholder={t('cart.addressPlaceholder')}
                  className="w-full px-4 py-3 bg-white/6 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#00AFCA]/50 focus:bg-white/8 transition-all resize-none"
                />
              </div>

              <div className="bg-white/[0.04] border border-white/8 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">{cart.length} {t('nav.products').toLowerCase()}</span>
                  <span className="font-black text-white text-lg">{formatPrice(total)} ₸</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 font-bold text-[#0A2540] rounded-xl transition-all hover:shadow-[0_0_24px_rgba(201,162,39,0.4)] hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                style={{ background: 'linear-gradient(135deg, #C9A227, #FFD700)' }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#0A2540]/30 border-t-[#0A2540] rounded-full animate-spin" />
                ) : (
                  t('cart.confirmOrder')
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
