'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Search, SlidersHorizontal, ShoppingCart, Shield, Leaf, X,
  ChevronLeft, ChevronRight, AlertTriangle, Package, Star, MapPin,
} from 'lucide-react';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { formatPrice, getStoredUser, getStoredCart, saveCart } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Product, Category, CartItem } from '@/types';

const FALLBACK_IMAGES: Record<string, string> = {
  meat:               'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&auto=format&fit=crop',
  beef:               'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop',
  dairy:              'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop',
  lamb:               'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=600&auto=format&fit=crop',
  'horse-meat':       'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop',
  poultry:            'https://images.unsplash.com/photo-1588347785102-2944b3776c2e?w=600&auto=format&fit=crop',
  milk:               'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop',
  'fermented-dairy':  'https://images.unsplash.com/photo-1559181567-c3190ca9be46?w=600&auto=format&fit=crop',
  cheese:             'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&auto=format&fit=crop',
  grain:              'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop',
  vegetables:         'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop',
  fruits:             'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop',
  eggs:               'https://images.unsplash.com/photo-1569288052389-dac9701be63f?w=600&auto=format&fit=crop',
  honey:              'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop',
  traditional:        'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop',
  default:            'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&auto=format&fit=crop',
};

const CATEGORY_EMOJI: Record<string, string> = {
  meat: '🥩', beef: '🥩', lamb: '🐑', 'horse-meat': '🐴', poultry: '🐔',
  dairy: '🥛', milk: '🥛', 'fermented-dairy': '🍶', cheese: '🧀',
  grain: '🌾', vegetables: '🥦', fruits: '🍎', eggs: '🥚', honey: '🍯',
  traditional: '🏺',
};

const CITY_CHIPS: Record<string, string> = {
  'Алматы': 'ALMATY', 'Астана': 'ASTANA', 'Капшагай': 'KAPSHAGAY',
  'Шымкент': 'SHYMKENT', 'Атырау': 'ATYRAU',
};

function getImageFallback(product: Product): string {
  if (product.imageUrl) return product.imageUrl;
  return FALLBACK_IMAGES[product.category?.slug ?? ''] ?? FALLBACK_IMAGES.default;
}

function getLocationChip(product: Product): string {
  const city = product.farmer?.city ?? product.farm?.location ?? '';
  return (CITY_CHIPS[city] ?? city.toUpperCase()) || 'KAZAKHSTAN';
}

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (p: Product, qty: number) => void }) {
  const { t } = useLanguage();
  const [qty, setQty] = useState(1);
  const [imgError, setImgError] = useState(false);
  const price = product.price ?? (product.discountActive ? product.retailPrice * 0.7 : product.retailPrice);
  const hasDiscount = product.discountActive && product.retailPrice !== price;
  const location = getLocationChip(product);
  const imageUrl = imgError ? FALLBACK_IMAGES.default : getImageFallback(product);
  const feedingLower = (product.feedingType ?? '').toLowerCase();
  const isOrganic =
    feedingLower.includes('трава') || feedingLower.includes('натур') ||
    feedingLower.includes('organic') || feedingLower.includes('органик') ||
    feedingLower.includes('жайылым') || feedingLower.includes('табиғ');

  const tierBadges = [];
  if (product.isAvailableRetail)  tierBadges.push({ label: 'B2C',   color: 'text-[#00AFCA] border-[#00AFCA]/30 bg-[#00AFCA]/10' });
  if (product.wholesalePrice)     tierBadges.push({ label: 'WHSL',  color: 'text-[#C9A227] border-[#C9A227]/30 bg-[#C9A227]/10' });
  if (product.isAvailableExport)  tierBadges.push({ label: 'EXPORT',color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' });

  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden border border-white/8 bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-sm hover:border-[#00AFCA]/35 transition-all duration-400 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.6),0_0_0_1px_rgba(0,175,202,0.15)]">
      {/* Image */}
      <div className="relative overflow-hidden h-52 flex-shrink-0">
        <img
          src={imageUrl}
          alt={product.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060D1A]/80 via-transparent to-transparent" />

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="flex items-center gap-1 bg-[#0A2540]/90 text-[#7DD8E8] text-[9px] font-black px-2.5 py-1 rounded-full border border-[#00AFCA]/25 backdrop-blur-sm tracking-wider">
            <MapPin size={7} /> {location}
          </span>
          {isOrganic && (
            <span className="flex items-center gap-1 bg-emerald-900/80 text-emerald-300 text-[9px] font-black px-2.5 py-1 rounded-full border border-emerald-500/30 backdrop-blur-sm">
              <Leaf size={7} /> ORGANIC
            </span>
          )}
        </div>

        {/* Verified shield */}
        <div className="absolute top-3 right-3">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm border transition-all duration-200 ${
              product.isVerified
                ? 'bg-[#00AFCA]/20 border-[#00AFCA]/40'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <Shield size={12} className={product.isVerified ? 'text-[#00AFCA]' : 'text-white/20'} />
          </div>
        </div>

        {/* Link overlay */}
        <Link href={`/products/${product.id}`} className="absolute inset-0 z-10" aria-label={product.name} />

        {/* Expiration Guard */}
        {product.discountActive && product.daysUntilExpiry !== undefined && product.daysUntilExpiry <= 5 && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-r from-amber-600 to-orange-500 text-white text-[10px] font-black px-3 py-1.5 flex items-center gap-1.5 z-20">
            <AlertTriangle size={10} />
            EXPIRATION GUARD: 30% OFF · {product.daysUntilExpiry}d LEFT
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col gap-2.5">
        {/* Category + farmer */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-black text-[#0089A7] bg-[#0089A7]/12 border border-[#0089A7]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {product.category?.name ?? 'Product'}
          </span>
          {product.farmer?.name && (
            <span className="text-[10px] text-gray-500 truncate">by {product.farmer.name}</span>
          )}
        </div>

        {/* Tier badges */}
        {tierBadges.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tierBadges.map((b) => (
              <span key={b.label} className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${b.color}`}>
                {b.label}
              </span>
            ))}
          </div>
        )}

        {/* Name */}
        <div>
          <Link href={`/products/${product.id}`}>
            <h3 className="font-bold text-white text-sm leading-snug hover:text-[#00AFCA] transition-colors duration-200 line-clamp-2">
              {product.name}
            </h3>
          </Link>
          {product.feedingType && (
            <p className="text-[10px] text-[#C9A227] font-semibold mt-0.5 truncate">{product.feedingType}</p>
          )}
        </div>

        {/* Stock row */}
        <div className="flex items-center gap-3 text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><Package size={9} /> {product.retailStock} кг</span>
          {product.daysUntilExpiry !== undefined && (
            <span>⏱ {product.daysUntilExpiry}d shelf</span>
          )}
          {product.averageRating && (
            <span className="flex items-center gap-1 ml-auto text-[#C9A227]">
              <Star size={9} fill="currentColor" /> {Number(product.averageRating).toFixed(1)}
            </span>
          )}
        </div>

        <div className="mt-auto space-y-2.5 pt-1 border-t border-white/5">
          {/* Price */}
          <div>
            <p className="text-[8px] font-black text-gray-600 tracking-[0.15em] mb-0.5">PRICE / KG</p>
            <div className="flex items-baseline gap-2">
              {hasDiscount && (
                <span className="text-xs text-gray-600 line-through">{formatPrice(product.retailPrice)}</span>
              )}
              <span className="text-xl font-black text-white">
                {formatPrice(Math.round(price))}
                <span className="text-sm font-bold text-[#00AFCA] ml-0.5">₸</span>
              </span>
              {hasDiscount && (
                <span className="text-[9px] font-black text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full border border-amber-400/20">
                  −30%
                </span>
              )}
            </div>
          </div>

          {/* Quantity + cart */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-white/10 bg-white/5 rounded-xl overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/8 transition-all text-base font-medium"
              >
                −
              </button>
              <span className="w-7 text-center text-xs font-black text-white">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.retailStock, q + 1))}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/8 transition-all text-base font-medium"
              >
                +
              </button>
            </div>
            <span className="text-[9px] text-gray-600">кг</span>

            <button
              onClick={() => onAddToCart(product, qty)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[#0A2540] text-[11px] font-black rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(201,162,39,0.4)] hover:scale-[1.02] active:scale-95"
              style={{ background: 'linear-gradient(135deg, #C9A227, #FFD700)' }}
            >
              <ShoppingCart size={11} /> {t('products.addToCart')}
            </button>
          </div>

          {/* Subtotal */}
          <p className="text-[10px] text-gray-600 text-right">
            {formatPrice(Math.round(price * qty))}₸ total
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | string>('ALL');
  const [page, setPage] = useState(1);
  const user = getStoredUser();

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const catId = selectedCategory || undefined;
      const res = await productsAPI.getAll(page, 12, catId, search || undefined);
      const data = res.data;
      setProducts(data.data || []);
      setTotal(data.pagination?.total ?? data.total ?? 0);
      setTotalPages(data.pagination?.pages ?? data.totalPages ?? 1);
    } catch {
      toast.error(t('products.loadError'));
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, activeTab, search]);

  useEffect(() => {
    categoriesAPI.getAll().then((r) => setCategories(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleAddToCart = (product: Product, qty = 1) => {
    if (!user) {
      toast.error(t('products.loginRequired'));
      router.push('/auth/login');
      return;
    }
    const cart: CartItem[] = getStoredCart();
    const price = product.price ?? product.retailPrice;
    const existing = cart.find((i) => i.productId === product.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({ productId: product.id, name: product.name, price, quantity: qty, imageUrl: product.imageUrl, retailStock: product.retailStock });
    }
    saveCart(cart);
    toast.success(`${product.name} × ${qty} кг`);
  };

  const handleTabClick = (_tab: string, catId = '') => {
    setActiveTab(catId === '' ? 'ALL' : catId);
    setSelectedCategory(catId);
    setPage(1);
  };

  const displayed = products;

  const tabs = [
    { label: 'ALL', id: '', emoji: '🛒' },
    ...categories.map((c) => ({ label: c.name, id: c.id, emoji: CATEGORY_EMOJI[c.slug] ?? '📦' })),
  ];

  const isTabActive = (tab: { id: string }) => tab.id === '' ? activeTab === 'ALL' : activeTab === tab.id;

  return (
    <div className="min-h-screen bg-[#060D1A]">
      {/* ── Header ── */}
      <div className="relative overflow-hidden py-16 bg-gradient-to-br from-[#0A2540] via-[#0D2D50] to-[#060D1A]">
        {/* Ambient blobs */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-[#00AFCA]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#C9A227]/8 rounded-full blur-3xl pointer-events-none" />

        <div className="container-custom relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#00AFCA]/12 border border-[#00AFCA]/30 text-[#7DD8E8] text-[10px] font-black px-3.5 py-1.5 rounded-full mb-6 tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00AFCA] animate-pulse" />
            {t('products.marketplace')}
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
            {t('products.catalogTitle')}
          </h1>
          <p className="text-[#7DD8E8]/70 text-sm mb-8 font-medium">
            {t('products.catalogSubtitle')}
          </p>

          {/* Search */}
          <form
            onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }}
            className="flex gap-2 max-w-xl"
          >
            <div className="relative flex-1">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('products.searchPlaceholder')}
                className="w-full pl-10 pr-10 py-3 bg-white/6 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#00AFCA]/50 focus:bg-white/8 transition-all duration-200"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => { setSearchInput(''); setSearch(''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-5 py-3 text-[#0A2540] font-black rounded-xl text-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(201,162,39,0.4)] hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #C9A227, #FFD700)' }}
            >
              {t('products.searchBtn')}
            </button>
          </form>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Category tab filters */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.label, tab.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                isTabActive(tab)
                  ? 'text-[#0A2540] shadow-[0_0_20px_rgba(201,162,39,0.3)]'
                  : 'bg-white/5 border border-white/8 text-gray-400 hover:border-[#00AFCA]/30 hover:text-[#7DD8E8]'
              }`}
              style={isTabActive(tab) ? { background: 'linear-gradient(135deg, #C9A227, #FFD700)' } : {}}
            >
              <span>{(tab as any).emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
          <div className="ml-auto flex-shrink-0">
            <button className="p-2.5 bg-white/5 border border-white/8 rounded-xl hover:border-[#00AFCA]/30 transition-colors">
              <SlidersHorizontal size={15} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Result count */}
        <p className="text-xs text-gray-600 font-semibold tracking-wider mb-6 uppercase">
          {loading ? t('products.loading') : `${total} ${t('products.found')}`}
        </p>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[420px] rounded-2xl bg-white/4 animate-pulse" />
            ))}
          </div>
        ) : displayed.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {displayed.map((product, idx) => (
              <div key={product.id} className="scale-in" style={{ animationDelay: `${idx * 0.04}s` }}>
                <ProductCard product={product} onAddToCart={handleAddToCart} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border border-white/6 rounded-3xl bg-white/[0.02]">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-xl font-bold text-white mb-2">{t('products.notFound')}</p>
            <p className="text-gray-500 text-sm">{t('products.notFoundSub')}</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2.5 bg-white/5 border border-white/8 rounded-xl hover:border-[#00AFCA]/30 disabled:opacity-30 transition-all duration-200 text-gray-400 hover:text-white"
            >
              <ChevronLeft size={17} />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-xl font-bold transition-all duration-200 text-sm ${
                  page === p
                    ? 'text-[#0A2540] shadow-[0_0_16px_rgba(201,162,39,0.3)]'
                    : 'bg-white/5 border border-white/8 hover:border-[#00AFCA]/30 text-gray-400 hover:text-white'
                }`}
                style={page === p ? { background: 'linear-gradient(135deg, #C9A227, #FFD700)' } : {}}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2.5 bg-white/5 border border-white/8 rounded-xl hover:border-[#00AFCA]/30 disabled:opacity-30 transition-all duration-200 text-gray-400 hover:text-white"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        )}

        {/* ── Live Export Routes ── */}
        <div className="mt-16 rounded-3xl overflow-hidden border border-white/8">
          <div className="bg-gradient-to-br from-[#0A2540] to-[#0D3256] p-8">
            <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
              <div>
                <p className="text-[#00AFCA] text-[10px] font-black tracking-[0.2em] mb-2">QAZAQTAMAQ EXPORT HUB</p>
                <h2 className="text-2xl font-black text-white">Live Export Routes</h2>
                <p className="text-gray-500 text-sm mt-1">Real-time B2B shipments from Kazakhstan</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black" style={{ background: 'linear-gradient(135deg, #C9A227, #FFD700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  412.8 t
                </p>
                <p className="text-[9px] text-gray-500 tracking-widest font-bold mt-0.5">MONTHLY EXPORT VOLUME</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { value: '24', label: 'ACTIVE FARMERS' },
                { value: '8', label: 'EXPORT DESTINATIONS' },
                { value: '156', label: 'B2B CONTRACTS' },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 border border-white/8 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-white">{s.value}</p>
                  <p className="text-[9px] text-gray-500 tracking-wider mt-1 font-bold">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="divide-y divide-white/8">
              {[
                { status: 'IN TRANSIT', dest: 'Russia, Moscow', cargo: 'Beef, 12t', eta: '18h', progress: 75, icon: '🚛' },
                { status: 'CUSTOMS', dest: 'China, Urumqi', cargo: 'Horse Meat, 8t', eta: '4h', progress: 45, icon: '🏛' },
                { status: 'AIR FREIGHT', dest: 'UAE, Dubai', cargo: 'Kumis, 2t', eta: '6h', progress: 60, icon: '✈️' },
                { status: 'LOADING', dest: 'Uzbekistan, Tashkent', cargo: 'Dairy Mix, 15t', eta: '24h', progress: 20, icon: '📦' },
              ].map((s) => (
                <div key={s.dest} className="py-4 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center flex-shrink-0 text-sm">
                    {s.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-[#00AFCA] tracking-widest mb-1">{s.status}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-sm font-bold text-white">{s.dest}</p>
                      <p className="text-xs text-gray-500">{s.cargo}</p>
                    </div>
                    <div className="mt-1.5 h-0.5 bg-white/8 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${s.progress}%`, background: 'linear-gradient(90deg, #0089A7, #00AFCA)' }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 flex-shrink-0 font-semibold">{s.eta}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
