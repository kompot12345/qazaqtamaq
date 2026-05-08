'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ShoppingCart, Star, MapPin, ArrowLeft, Minus, Plus, Flame,
  Shield, Truck, Award, Calendar, Wheat, Droplets, Package
} from 'lucide-react';
import { productsAPI, reviewsAPI } from '@/lib/api';
import { formatPrice, formatDate, getStoredUser, getStoredCart, saveCart } from '@/lib/utils';
import type { Product, Review, CartItem } from '@/types';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  const user = getStoredUser();

  useEffect(() => {
    const load = async () => {
      try {
        const [productRes, reviewsRes] = await Promise.all([
          productsAPI.getById(id),
          reviewsAPI.getByProduct(id).catch(() => ({ data: [] })),
        ]);
        setProduct(productRes.data);
        setReviews(reviewsRes.data || []);
      } catch {
        toast.error('Продукт не найден');
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, router]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Войдите для добавления в корзину');
      router.push('/auth/login');
      return;
    }
    if (!product) return;
    setAddingToCart(true);
    try {
      const cart: CartItem[] = getStoredCart();
      const existing = cart.find((i) => i.productId === product.id);
      const price = product.currentPrice ?? product.retailPrice;
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({
          productId: product.id,
          name: product.name,
          price,
          quantity,
          imageUrl: product.imageUrl,
          retailStock: product.retailStock,
        });
      }
      saveCart(cart);
      toast.success(`${product.name} (${quantity} кг) добавлен в корзину!`);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Войдите для отзыва'); return; }
    setSubmittingReview(true);
    try {
      await reviewsAPI.create(id, { rating: reviewRating, comment: reviewText });
      toast.success('Отзыв добавлен!');
      setReviewText('');
      const res = await reviewsAPI.getByProduct(id);
      setReviews(res.data || []);
    } catch {
      toast.error('Не удалось добавить отзыв');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-sky-50/30">
        <div className="container-custom py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="h-96 bg-gray-200 rounded-3xl" />
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
                <div className="h-20 bg-gray-200 rounded" />
                <div className="h-16 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const price = product.currentPrice ?? product.retailPrice;
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-sky-50/30">
      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-[#0A2540] transition-colors">Главная</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#0A2540] transition-colors">Продукты</Link>
          <span>/</span>
          <span className="text-[#0A2540] font-medium truncate">{product.name}</span>
        </div>

        <Link href="/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#0A2540] mb-6 transition-colors font-medium">
          <ArrowLeft size={18} /> Назад к каталогу
        </Link>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-sky-50 to-sky-100 shadow-xl">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-9xl opacity-20">🥩</span>
                </div>
              )}
            </div>
            {product.discountActive && (
              <div className="absolute top-6 left-6 flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-4 py-2 rounded-full shadow-lg">
                <Flame size={16} /> Expiration Guard — Скидка 30%
              </div>
            )}
            {product.farm?.isVerified && (
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full flex items-center gap-2 shadow-md">
                <Award size={16} className="text-[#D4AF37]" />
                <span className="text-xs font-bold text-[#0A2540]">Верифицирован</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {product.category && (
              <span className="inline-block badge-accent mb-4">{product.category.name}</span>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-[#0A2540] mb-3">{product.name}</h1>

            {/* Rating */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className={i < Math.round(avgRating) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-200 fill-gray-200'} />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-600">({reviews.length} отзывов)</span>
              </div>
            )}

            {/* Farm */}
            {product.farm && (
              <div className="flex items-center gap-2 text-gray-600 mb-6">
                <MapPin size={16} className="text-[#D4AF37]" />
                <span className="font-medium">{product.farm.name}</span>
                {product.farm.location && <span className="text-gray-400">• {product.farm.location}</span>}
              </div>
            )}

            {/* Price */}
            <div className="bg-gradient-to-br from-[#0A2540]/5 to-[#FFD700]/5 rounded-2xl p-6 mb-6 border border-sky-100">
              <div className="flex items-end gap-3 mb-3">
                <p className="text-4xl font-bold text-[#0A2540]">{formatPrice(price)} ₸</p>
                <span className="text-gray-500 mb-1">/кг</span>
                {product.discountActive && (
                  <p className="text-lg text-gray-400 line-through mb-1">{formatPrice(product.retailPrice)} ₸</p>
                )}
              </div>

              {user?.role === 'B2B_BUYER' && (
                <p className="text-sm text-blue-600 font-semibold">
                  Оптовая цена: {formatPrice(product.wholesalePrice)} ₸/кг
                </p>
              )}

              {product.daysUntilExpiry !== undefined && product.daysUntilExpiry <= 5 && (
                <p className="text-sm text-orange-600 font-medium mt-2 flex items-center gap-1">
                  <Calendar size={14} /> Срок годности истекает через {product.daysUntilExpiry} дн.
                </p>
              )}
            </div>

            {/* Product attrs */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {product.feedingType && (
                <div className="flex items-center gap-2 p-3 bg-sky-50 rounded-xl">
                  <Wheat size={16} className="text-[#00AFCA]" />
                  <div>
                    <p className="text-xs text-gray-500">Тип корма</p>
                    <p className="text-sm font-semibold text-[#0A2540]">{product.feedingType}</p>
                  </div>
                </div>
              )}
              {product.fatContent && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-xl">
                  <Droplets size={16} className="text-yellow-600" />
                  <div>
                    <p className="text-xs text-gray-500">Жирность</p>
                    <p className="text-sm font-semibold text-[#0A2540]">{product.fatContent}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                <Package size={16} className="text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">На складе</p>
                  <p className="text-sm font-semibold text-[#0A2540]">{product.retailStock} кг</p>
                </div>
              </div>
              {product.expirationDate && (
                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl">
                  <Calendar size={16} className="text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500">Годен до</p>
                    <p className="text-sm font-semibold text-[#0A2540]">{formatDate(product.expirationDate)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quantity + Add to cart */}
            <div className="flex gap-4 mb-6">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700"
                >
                  <Minus size={16} />
                </button>
                <span className="px-5 py-3 font-bold text-[#0A2540] border-x border-gray-200 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.retailStock, quantity + 1))}
                  className="px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700"
                >
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || product.retailStock === 0}
                className="flex-1 flex items-center justify-center gap-2 btn-primary py-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {addingToCart ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    {product.retailStock === 0 ? 'Нет в наличии' : 'В корзину'}
                  </>
                )}
              </button>
            </div>

            {/* Total */}
            <p className="text-sm text-gray-500 mb-6">
              Итого: <span className="font-bold text-[#0A2540]">{formatPrice(price * quantity)} ₸</span>
            </p>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
              <div className="text-center">
                <Shield size={20} className="text-[#D4AF37] mx-auto mb-1" />
                <p className="text-xs text-gray-600 font-medium">Гарантия качества</p>
              </div>
              <div className="text-center">
                <Truck size={20} className="text-[#D4AF37] mx-auto mb-1" />
                <p className="text-xs text-gray-600 font-medium">Быстрая доставка</p>
              </div>
              <div className="text-center">
                <Award size={20} className="text-[#D4AF37] mx-auto mb-1" />
                <p className="text-xs text-gray-600 font-medium">Сертифицировано</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-[#0A2540] mb-4">Описание</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>
          </div>

          {/* Farm info */}
          {product.farm && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-[#0A2540] mb-4">О ферме</h2>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0A2540] to-[#0D3256] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  🌾
                </div>
                <div>
                  <p className="font-bold text-[#0A2540]">{product.farm.name}</p>
                  {product.farm.isVerified && (
                    <span className="badge-success text-xs">Верифицирован</span>
                  )}
                </div>
              </div>
              {product.farm.location && (
                <p className="text-sm text-gray-600 flex items-center gap-1 mb-3">
                  <MapPin size={14} className="text-[#D4AF37]" /> {product.farm.location}
                </p>
              )}
              {product.farm.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < Math.round(product.farm!.rating!) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-200 fill-gray-200'} />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{product.farm.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[#0A2540] mb-8">
            Отзывы {reviews.length > 0 && <span className="text-gray-400 font-normal text-lg">({reviews.length})</span>}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Review form */}
            <div className="card p-6">
              <h3 className="font-bold text-[#0A2540] mb-4">Оставить отзыв</h3>
              {user ? (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Оценка</p>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setReviewRating(i + 1)}
                          className="transition-transform hover:scale-125"
                        >
                          <Star size={24} className={i < reviewRating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-200 fill-gray-200'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Напишите ваш отзыв..."
                    rows={4}
                    className="input-field resize-none"
                  />
                  <button
                    type="submit"
                    disabled={submittingReview || !reviewText.trim()}
                    className="w-full btn-primary disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {submittingReview ? 'Отправка...' : 'Отправить отзыв'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">Войдите для отзыва</p>
                  <Link href="/auth/login" className="btn-primary">Войти</Link>
                </div>
              )}
            </div>

            {/* Reviews list */}
            <div className="lg:col-span-2 space-y-4">
              {reviews.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-4xl mb-3">💬</p>
                  <p className="text-gray-500">Ещё нет отзывов. Будьте первым!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-[#0A2540]">{review.user?.name || 'Анонимный покупатель'}</p>
                        <div className="flex gap-0.5 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={14} className={i < review.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-200 fill-gray-200'} />
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
                        {review.isVerifiedPurchase && (
                          <span className="text-xs text-[#00AFCA] font-semibold">✓ Проверенная покупка</span>
                        )}
                      </div>
                    </div>
                    {review.comment && <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
