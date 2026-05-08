'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Search, SlidersHorizontal, ShoppingCart, Shield, Leaf, X, ChevronLeft, ChevronRight, AlertTriangle, Package } from 'lucide-react';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { formatPrice, getStoredUser, getStoredCart, saveCart } from '@/lib/utils';
import type { Product, Category, CartItem } from '@/types';

// Real Kazakh food photos (Unsplash)
const FALLBACK_IMAGES: Record<string, string> = {
  meat:        'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&auto=format&fit=crop',
  beef:        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop',
  dairy:       'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop',
  lamb:        'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=600&auto=format&fit=crop',
  'horse-meat':'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop',
  poultry:     'https://images.unsplash.com/photo-1588347785102-2944b3776c2e?w=600&auto=format&fit=crop',
  milk:        'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop',
  'fermented-dairy': 'https://images.unsplash.com/photo-1559181567-c3190ca9be46?w=600&auto=format&fit=crop',
  cheese:      'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&auto=format&fit=crop',
  grain:       'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop',
  vegetables:  'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop',
  fruits:      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop',
  eggs:        'https://images.unsplash.com/photo-1569288052389-dac9701be63f?w=600&auto=format&fit=crop',
  honey:       'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop',
  traditional: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop',
  default:     'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&auto=format&fit=crop',
};

const CATEGORY_EMOJI: Record<string, string> = {
  meat: '🥩', beef: '🥩', lamb: '🐑', 'horse-meat': '🐴', poultry: '🐔',
  dairy: '🥛', milk: '🥛', 'fermented-dairy': '🍶', cheese: '🧀',
  grain: '🌾', vegetables: '🥦', fruits: '🍎', eggs: '🥚', honey: '🍯',
  traditional: '🏺',
};

const CITY_CHIPS: Record<string, string> = {
  'Алматы': 'ALMATY',
  'Астана': 'ASTANA',
  'Капшагай': 'KAPSHAGAY',
  'Шымкент': 'SHYMKENT',
  'Атырау': 'ATYRAU',
};

function getImageFallback(product: Product): string {
  if (product.imageUrl) return product.imageUrl;
  const cat = product.category?.slug ?? '';
  return FALLBACK_IMAGES[cat] ?? FALLBACK_IMAGES.default;
}

function getLocationChip(product: Product): string {
  const city = (product as any).farmer?.city ?? (product as any).farm?.location ?? '';
  return (CITY_CHIPS[city] ?? city.toUpperCase()) || 'KAZAKHSTAN';
}

// Tier badges shown on each card
function TierBadges({ product }: { product: Product }) {
  const tiers = [];
  if (product.isAvailableRetail) tiers.push({ label: 'B2C', color: 'bg-[#0A2540] text-white' });
  if (product.wholesalePrice) tiers.push({ label: 'SMALL WHOLESALE', color: 'bg-[#0A2540]/80 text-white' });
  if (product.isAvailableExport) tiers.push({ label: 'EXPORT', color: 'bg-[#0A2540]/60 text-white' });
  return (
    <div className="flex flex-wrap gap-1">
      {tiers.map((t) => (
        <span key={t.label} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.color}`}>
          {t.label}
        </span>
      ))}
    </div>
  );
}

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (p: Product, qty: number) => void }) {
  const [qty, setQty] = useState(1);
  const price = product.price ?? (product.discountActive ? product.retailPrice * 0.7 : product.retailPrice);
  const originalPrice = product.retailPrice;
  const hasDiscount = product.discountActive || (product.discountActive && product.retailPrice !== price);
  const location = getLocationChip(product);
  const imageUrl = getImageFallback(product);
  const feedingLower = ((product as any).feedingType ?? '').toLowerCase();
  const isOrganic = feedingLower.includes('трава') || feedingLower.includes('натур') ||
    feedingLower.includes('organic') || feedingLower.includes('органик') ||
    feedingLower.includes('жайылым') || feedingLower.includes('табиғ');

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Image area */}
      <div className="relative overflow-hidden">
        {/* Location + Organic overlay */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          <span className="bg-[#0A2540] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            {location}
          </span>
          {isOrganic && (
            <span className="bg-[#10B981] text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Leaf size={9} /> ORGANIC
            </span>
          )}
        </div>

        {/* Shield verified top-right */}
        <div className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow">
          <Shield size={14} className={(product as any).isVerified ? 'text-[#00AFCA]' : 'text-gray-300'} />
        </div>

        <Link href={`/products/${product.id}`}>
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-52 object-cover hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGES.default; }}
          />
        </Link>

        {/* Expiration Guard banner */}
        {product.discountActive && product.daysUntilExpiry !== undefined && product.daysUntilExpiry <= 5 && (
          <div className="absolute bottom-0 inset-x-0 bg-amber-500 text-white text-[11px] font-bold px-3 py-1.5 flex items-center gap-1.5">
            <AlertTriangle size={12} />
            EXPIRATION GUARD: 30% OFF ({product.daysUntilExpiry} DAYS LEFT)
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Category + farm */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#0089A7] bg-[#E8F6FA] px-2 py-0.5 rounded-full uppercase">
            {product.category?.name ?? 'Продукт'}
          </span>
          {(product as any).farmer?.name && (
            <span className="text-[11px] text-gray-400">by {(product as any).farmer.name}</span>
          )}
        </div>

        {/* Tier badges */}
        <TierBadges product={product} />

        {/* Name */}
        <div>
          <Link href={`/products/${product.id}`}>
            <h3 className="font-bold text-[#0A2540] text-[15px] leading-snug hover:text-[#0089A7] transition-colors">
              {product.name}
            </h3>
          </Link>
          {(product as any).feedingType && (
            <p className="text-[11px] text-[#C9A227] font-semibold mt-0.5">
              {(product as any).feedingType}
            </p>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <Package size={11} /> {product.retailStock} кг available
          </span>
          {product.daysUntilExpiry !== undefined && (
            <span className="flex items-center gap-1">
              ⏱ {product.daysUntilExpiry} days shelf life
            </span>
          )}
        </div>

        <div className="mt-auto space-y-3">
          {/* Price */}
          <div>
            <p className="text-[9px] font-bold text-gray-400 tracking-widest mb-1">PRICE PER KG</p>
            <div className="flex items-baseline gap-2">
              {hasDiscount && price !== originalPrice && (
                <span className="text-sm text-gray-400 line-through">{formatPrice(originalPrice)}₸</span>
              )}
              <span className="text-2xl font-bold text-[#0A2540]">
                {formatPrice(Math.round(price))} <span className="text-base font-semibold text-[#0089A7]">₸</span>
              </span>
            </div>
          </div>

          {/* Quantity + add to cart */}
          <div className="flex items-center gap-2">
            {/* Stepper */}
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-8 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors text-lg font-medium"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-bold text-[#0A2540]">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.retailStock, q + 1))}
                className="w-8 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors text-lg font-medium"
              >
                +
              </button>
            </div>
            <span className="text-[10px] text-gray-400 flex-shrink-0">кг</span>

            <button
              onClick={() => onAddToCart(product, qty)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#0A2540] hover:bg-[#0089A7] text-white text-[12px] font-bold rounded-xl transition-colors"
            >
              <ShoppingCart size={13} /> Add to Cart
            </button>
          </div>

          {/* Subtotal */}
          <p className="text-[11px] text-gray-400 text-center">
            Subtotal: <span className="font-semibold text-gray-600">{formatPrice(Math.round(price * qty))}₸</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const router = useRouter();
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
      const res = await productsAPI.getAll(page, 12, catId);
      const data = res.data;
      setProducts(data.data || []);
      setTotal(data.pagination?.total ?? data.total ?? 0);
      setTotalPages(data.pagination?.pages ?? data.totalPages ?? 1);
    } catch {
      toast.error('Не удалось загрузить продукты');
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, activeTab]);

  useEffect(() => {
    categoriesAPI.getAll().then((r) => setCategories(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleAddToCart = (product: Product, qty = 1) => {
    if (!user) {
      toast.error('Войдите для добавления в корзину');
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
    toast.success(`${product.name} × ${qty} кг — добавлен в корзину`);
  };

  const handleTabClick = (tab: string, catId = '') => {
    setActiveTab(catId === '' ? 'ALL' : catId);
    setSelectedCategory(catId);
    setPage(1);
  };

  const displayed = search
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  const tabs = [
    { label: 'ALL', id: '', emoji: '🛒' },
    ...categories.map((c) => ({
      label: c.name,
      id: c.id,
      emoji: CATEGORY_EMOJI[c.slug] ?? '📦',
    })),
  ];

  const isTabActive = (tab: { id: string; label: string }) =>
    tab.id === '' ? activeTab === 'ALL' : activeTab === tab.id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0A2540] to-[#0D3256] py-14">
        <div className="container-custom">
          {/* Breadcrumb badge */}
          <div className="inline-flex items-center gap-2 bg-[#00AFCA]/20 border border-[#00AFCA]/40 text-[#7DD8E8] text-xs font-bold px-3 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-[#00AFCA] animate-pulse" />
            HYBRID B2B/B2C MARKETPLACE
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Product Catalog</h1>
          <p className="text-[#7DD8E8] text-sm mb-8">Dynamic pricing by account type · Dual inventory tracking</p>

          {/* Search */}
          <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }} className="flex gap-3 max-w-xl">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search: beef, lamb, milk..."
                className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-[#00AFCA] focus:ring-2 focus:ring-[#00AFCA]/20 transition-all"
              />
              {searchInput && (
                <button type="button" onClick={() => { setSearchInput(''); setSearch(''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>
            <button type="submit" className="px-5 py-3 bg-[#C9A227] hover:bg-[#FFD700] text-[#0A2540] font-bold rounded-xl text-sm transition-colors">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Tab filters */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.label, tab.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isTabActive(tab)
                  ? 'bg-[#0A2540] text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#00AFCA] hover:text-[#0089A7]'
              }`}
            >
              <span>{(tab as any).emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:border-[#00AFCA] transition-colors">
              <SlidersHorizontal size={16} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Count */}
        <p className="text-sm text-gray-500 mb-6">
          {loading ? 'Loading...' : `${total} products found`}
        </p>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-96 bg-gray-100 rounded-2xl animate-pulse shimmer" />
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
          <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-3xl">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-xl font-bold text-gray-700 mb-2">No products found</p>
            <p className="text-gray-400 text-sm">Try different search terms or category</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="p-2.5 border border-gray-200 rounded-xl hover:border-[#00AFCA] disabled:opacity-40 transition-all">
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-xl font-semibold transition-all text-sm ${
                  page === p ? 'bg-[#0A2540] text-white' : 'border border-gray-200 hover:border-[#00AFCA] text-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
              className="p-2.5 border border-gray-200 rounded-xl hover:border-[#00AFCA] disabled:opacity-40 transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Live Export Routes section */}
        <div className="mt-16 bg-gradient-to-br from-[#0A2540] to-[#0D3256] rounded-3xl p-8 text-white">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
            <div>
              <p className="text-[#00AFCA] text-xs font-bold tracking-widest mb-2">QAZAQTAMAQ EXPORT HUB</p>
              <h2 className="text-3xl font-bold">Live Export Routes</h2>
              <p className="text-gray-400 text-sm mt-1">Real-time B2B shipments from Kazakhstan</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-[#C9A227]">412.8 t</p>
              <p className="text-xs text-gray-400 tracking-widest">MONTHLY EXPORT VOLUME</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { value: '24', label: 'ACTIVE FARMERS' },
              { value: '8', label: 'EXPORT DESTINATIONS' },
              { value: '156', label: 'B2B CONTRACTS ACTIVE' },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 rounded-2xl p-4">
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-[10px] text-gray-400 tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Shipments */}
          <div className="space-y-0 divide-y divide-white/10">
            {[
              { status: 'IN TRANSIT', dest: 'Russia, Moscow', cargo: 'Beef, 12t', eta: '18h to delivery', progress: 75 },
              { status: 'CUSTOMS CLEARANCE', dest: 'China, Urumqi', cargo: 'Horse Meat, 8t', eta: '4h to release', progress: 45 },
              { status: 'AIR FREIGHT', dest: 'UAE, Dubai', cargo: 'Kumis, 2t', eta: '6h to arrival', progress: 60 },
              { status: 'LOADING', dest: 'Uzbekistan, Tashkent', cargo: 'Dairy Mix, 15t', eta: '24h to departure', progress: 20 },
            ].map((s) => (
              <div key={s.dest} className="py-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">
                    {s.status === 'IN TRANSIT' ? '🚛' : s.status === 'CUSTOMS CLEARANCE' ? '🏛' : s.status === 'AIR FREIGHT' ? '✈️' : '📦'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-[#00AFCA] tracking-wider mb-0.5">{s.status}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm font-bold text-white">{s.dest}</p>
                    <p className="text-xs text-gray-400">{s.cargo}</p>
                  </div>
                  <div className="mt-1.5 h-0.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00AFCA] rounded-full transition-all" style={{ width: `${s.progress}%` }} />
                  </div>
                </div>
                <p className="text-xs text-gray-400 flex-shrink-0 text-right">{s.eta}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
