'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { Leaf, Globe, Users, TrendingUp, Check, Zap, Award, Shield } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Product, Category } from '@/types';

const CATEGORY_EMOJI: Record<string, string> = {
  meat: '🥩', beef: '🥩', lamb: '🐑', 'horse-meat': '🐴', poultry: '🐔',
  dairy: '🥛', milk: '🥛', 'fermented-dairy': '🍶', cheese: '🧀',
  grain: '🌾', vegetables: '🥦', fruits: '🍎', eggs: '🥚', honey: '🍯',
  traditional: '🏺',
};

const GlobeCanvas = dynamic(() => import('@/components/three/GlobeCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-2 border-[#FFD700]/40 border-t-[#FFD700] animate-spin" />
    </div>
  ),
});

const FarmerCanvas = dynamic(() => import('@/components/three/FarmerCanvas'), {
  ssr: false,
  loading: () => <div className="w-full h-full" />,
});

export default function HomePage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productsAPI.getAll(1, 6),
          categoriesAPI.getAll(),
        ]);
        setProducts(productsRes.data?.data || []);
        setCategories(categoriesRes.data || []);
      } catch {
        // Non-critical — page still renders without featured products
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden py-20 md:py-32 bg-gradient-to-br from-[#0A2540] via-[#0D3256] to-[#060D1A]">
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FFD700] rounded-full mix-blend-screen blur-3xl animate-float" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00AFCA] rounded-full mix-blend-screen blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container-custom relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left: Text */}
            <div className="flex-1 max-w-2xl">
              <div className="inline-block mb-6 slide-up">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#FFD700]/20 border border-[#FFD700]/50 rounded-full backdrop-blur-sm">
                  <Zap size={16} className="text-[#FFD700]" />
                  <span className="text-sm font-semibold text-[#FFD700]">{t('home.badge')}</span>
                </div>
              </div>

              <h1 className="section-title text-white mb-6 slide-up" style={{ animationDelay: '0.1s' }}>
                {t('home.heroTitle')}
              </h1>

              <p className="text-xl text-gray-100 mb-8 max-w-xl leading-relaxed slide-up" style={{ animationDelay: '0.2s' }}>
                {t('home.heroSubtitle')}
              </p>

              <div className="flex gap-4 flex-col sm:flex-row slide-up" style={{ animationDelay: '0.3s' }}>
                <Link href="/products" className="btn-primary text-center text-lg px-8 py-4">
                  {t('home.viewProducts')}
                </Link>
                <Link href="/gamification" className="btn-secondary text-center text-lg px-8 py-4 flex items-center justify-center gap-2">
                  {t('home.playGame')}
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-6 slide-up" style={{ animationDelay: '0.4s' }}>
                {[
                  ['500+', t('home.statFarmers')],
                  ['10K+', t('home.statProducts')],
                  ['50K+', t('home.statBuyers')],
                ].map(([val, label]) => (
                  <div key={label} className="text-center group">
                    <p className="stat-number mb-1 group-hover:scale-110 transition-transform duration-200">{val}</p>
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: 3D Silk Road Globe */}
            <div className="w-full lg:w-[480px] h-[340px] lg:h-[480px] flex-shrink-0 relative slide-up" style={{ animationDelay: '0.2s' }}>
              <GlobeCanvas />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-5 text-xs bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                <span className="flex items-center gap-1.5 text-[#FFD700]">
                  <span className="w-2 h-2 rounded-full bg-[#FFD700] animate-pulse inline-block" />
                  {t('home.globeFarmers')}
                </span>
                <span className="flex items-center gap-1.5 text-[#00AFCA]">
                  <span className="w-2 h-2 rounded-full bg-[#00AFCA] animate-pulse inline-block" />
                  {t('home.globeBuyers')}
                </span>
                <span className="flex items-center gap-1.5 text-[#FFD700]/70">
                  <span className="w-4 h-0.5 bg-[#FFD700] inline-block" />
                  {t('home.globeRoute')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Character Strip — Tattibeke & Erlan ── */}
      <section className="relative bg-[#060D1A] overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A2540]/60 to-transparent pointer-events-none" />

        <div className="container-custom relative z-10">
          <div className="flex items-end justify-between gap-4">

            {/* ── Tattibeke (female) ── */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="mb-3 relative max-w-[190px]">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl rounded-bl-none px-4 py-2.5 shadow-lg">
                  <p className="text-white text-sm leading-snug">{t('home.tattibekeQuote')}</p>
                </div>
                <div className="absolute -bottom-2 left-4 w-3 h-3 bg-white/10 border-b border-l border-white/20"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
              </div>
              <div className="w-[160px] h-[290px]">
                <FarmerCanvas gender="female" waving cameraY={1.0} cameraZ={3.6} />
              </div>
              <div className="mb-4 px-3 py-1 bg-[#FFD700]/20 border border-[#FFD700]/40 rounded-full">
                <p className="text-[#FFD700] text-xs font-bold tracking-wide">{t('home.tattibeke')}</p>
              </div>
            </div>

            {/* ── Centre tagline ── */}
            <div className="flex-1 text-center pb-10 px-4 hidden md:block">
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-[#00AFCA]/10 border border-[#00AFCA]/30 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00AFCA] animate-pulse" />
                <span className="text-[#00AFCA] text-xs font-semibold tracking-wider">{t('home.platformChars')}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {t('home.charTagline')}<br />
                <span style={{ background: 'linear-gradient(90deg,#FFD700,#00AFCA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {t('home.charTaglineHighlight')}
                </span>
              </h3>
              <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
                {t('home.charDesc')}
              </p>
            </div>

            {/* ── Erlan (male) ── */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="mb-3 relative max-w-[190px]">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl rounded-br-none px-4 py-2.5 shadow-lg">
                  <p className="text-white text-sm leading-snug">{t('home.erlanQuote')}</p>
                </div>
                <div className="absolute -bottom-2 right-4 w-3 h-3 bg-white/10 border-b border-r border-white/20"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} />
              </div>
              <div className="w-[160px] h-[290px]">
                <FarmerCanvas gender="male" cameraY={1.0} cameraZ={3.6} />
              </div>
              <div className="mb-4 px-3 py-1 bg-[#00AFCA]/20 border border-[#00AFCA]/40 rounded-full">
                <p className="text-[#00AFCA] text-xs font-bold tracking-wide">{t('home.erlan')}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Key Features ── */}
      <section className="py-20 bg-[#060D1A] relative overflow-hidden">
        {/* Ambient */}
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#00AFCA]/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-[#C9A227]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container-custom relative z-10">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-[#00AFCA]/10 border border-[#00AFCA]/20 text-[#7DD8E8] text-[10px] font-black px-3.5 py-1.5 rounded-full mb-5 tracking-widest">
              WHY QAZAQTAMAQ
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">{t('home.whyUs')}</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">{t('home.whyUsSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { Icon: Leaf, titleKey: 'home.featureFreshTitle', descKey: 'home.featureFreshDesc', color: '#4ADE80', glow: 'rgba(74,222,128,0.15)' },
              { Icon: Globe, titleKey: 'home.featureGlobalTitle', descKey: 'home.featureGlobalDesc', color: '#00AFCA', glow: 'rgba(0,175,202,0.15)' },
              { Icon: Users, titleKey: 'home.featureDirectTitle', descKey: 'home.featureDirectDesc', color: '#C9A227', glow: 'rgba(201,162,39,0.15)' },
              { Icon: TrendingUp, titleKey: 'home.featurePricingTitle', descKey: 'home.featurePricingDesc', color: '#818CF8', glow: 'rgba(129,140,248,0.15)' },
            ].map(({ Icon, titleKey, descKey, color, glow }) => (
              <div
                key={titleKey}
                className="relative p-7 rounded-2xl border border-white/6 bg-gradient-to-b from-white/[0.05] to-transparent group hover:border-white/12 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                  style={{ background: `radial-gradient(ellipse at top left, ${glow} 0%, transparent 60%)` }}
                />
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 border border-white/8 transition-all duration-300 group-hover:scale-110"
                  style={{ background: `${color}18` }}
                >
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 className="font-bold text-white text-base mb-2">{t(titleKey)}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Strip ── */}
      <section className="py-12 bg-[#060D1A] border-y border-white/5">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { Icon: Award, labelKey: 'home.trustFarmers', subKey: 'home.trustFarmersSub' },
              { Icon: Shield, labelKey: 'home.trustPayment', subKey: 'home.trustPaymentSub' },
              { Icon: Check, labelKey: 'home.trustQuality', subKey: 'home.trustQualitySub' },
              { Icon: Zap, labelKey: 'home.trustDelivery', subKey: 'home.trustDeliverySub' },
            ].map(({ Icon, labelKey, subKey }) => (
              <div key={labelKey} className="flex flex-col items-center text-center group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-[#C9A227]/12 border border-[#C9A227]/20 group-hover:bg-[#C9A227]/20 transition-colors duration-200">
                  <Icon className="w-5 h-5 text-[#C9A227]" />
                </div>
                <p className="font-bold text-white text-sm">{t(labelKey)}</p>
                <p className="text-xs text-gray-600 mt-0.5">{t(subKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-20 bg-[#060D1A]">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-10">
            <div>
              <p className="text-[#00AFCA] text-[10px] font-black tracking-[0.2em] mb-2">FRESH FROM KAZAKH FARMS</p>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">{t('home.featuredTitle')}</h2>
              <p className="text-gray-500 text-sm">{t('home.featuredSubtitle')}</p>
            </div>
            <Link
              href="/products"
              className="flex-shrink-0 px-5 py-2.5 text-[#0A2540] font-black text-sm rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(201,162,39,0.4)] hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #C9A227, #FFD700)' }}
            >
              {t('home.viewAll')} →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-white/[0.04] animate-pulse" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((product: any, idx: number) => (
                <div key={product.id} className="scale-in" style={{ animationDelay: `${idx * 0.07}s` }}>
                  <Link href={`/products/${product.id}`}>
                    <div className="group relative rounded-2xl overflow-hidden border border-white/8 bg-gradient-to-b from-white/[0.05] to-white/[0.02] hover:border-[#00AFCA]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
                      {product.imageUrl ? (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#060D1A]/70 via-transparent to-transparent" />
                          {product.discountActive && (
                            <div className="absolute top-3 right-3 badge-accent shadow-lg text-[9px]">
                              {t('home.discount')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-[#0A2540] to-[#0D3256] flex items-center justify-center">
                          <span className="text-4xl opacity-30">🌾</span>
                        </div>
                      )}
                      <div className="p-5">
                        <p className="text-[9px] font-black text-[#0089A7] tracking-widest mb-1.5 uppercase">
                          {product.category?.name}
                        </p>
                        <h3 className="font-bold text-white text-sm mb-3 group-hover:text-[#00AFCA] transition-colors duration-200 line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-[8px] text-gray-600 font-black tracking-widest mb-0.5">
                              {t('home.price')}
                            </p>
                            <p className="text-xl font-black text-white">
                              {product.price}
                              <span className="text-sm font-bold text-[#00AFCA] ml-0.5">₸</span>
                            </p>
                          </div>
                          <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                            {t('home.inStock')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-white/6 rounded-3xl">
              <p className="text-gray-500 text-base font-medium">{t('home.noProducts')}</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <section className="py-20 bg-[#060D1A] border-t border-white/5">
          <div className="container-custom">
            <div className="text-center mb-12">
              <p className="text-[#C9A227] text-[10px] font-black tracking-[0.2em] mb-3">BROWSE BY CATEGORY</p>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">{t('home.categoriesTitle')}</h2>
              <p className="text-gray-500 text-sm max-w-lg mx-auto">{t('home.categoriesSubtitle')}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category: any, idx: number) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.id}`}
                  className="scale-in group"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="relative p-6 rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.05] to-transparent text-center h-full hover:border-[#C9A227]/35 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] overflow-hidden">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                      style={{ background: 'radial-gradient(ellipse at top, rgba(201,162,39,0.1) 0%, transparent 60%)' }}
                    />
                    <p className="text-2xl mb-3">{CATEGORY_EMOJI[category.slug] ?? '📦'}</p>
                    <h3 className="font-bold text-sm text-white group-hover:text-[#FFD700] transition-colors duration-200">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-[11px] text-gray-600 mt-1.5 line-clamp-2">{category.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="relative py-20 bg-gradient-to-br from-[#0A2540] to-[#0D3256] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700] rounded-full mix-blend-screen blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#00AFCA] rounded-full mix-blend-screen blur-3xl" />
        </div>

        <div className="container-custom relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('home.ctaTitle')}
            </h2>
            <p className="text-xl text-gray-100 mb-10">
              {t('home.ctaSubtitle')}
            </p>
            <div className="flex gap-4 justify-center flex-col sm:flex-row">
              <Link href="/auth/register" className="btn-secondary text-lg px-8 py-4">
                {t('home.ctaRegister')}
              </Link>
              <Link href="/products" className="btn-accent text-lg px-8 py-4">
                {t('home.ctaViewProducts')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-16 bg-gradient-to-b from-gray-900 to-black text-gray-300">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            <div>
              <h4 className="font-bold text-white mb-4 text-lg">QazaqTamaq</h4>
              <p className="text-sm leading-relaxed">{t('home.footerDesc')}</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">{t('home.footerPlatform')}</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/products" className="hover:text-white transition-colors">{t('home.footerProducts')}</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">{t('home.footerAbout')}</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">{t('home.footerHome')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">{t('home.footerForFarmers')}</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/auth/register" className="hover:text-white transition-colors">{t('home.footerRegister')}</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">{t('home.footerCabinet')}</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">{t('home.footerHelp')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">{t('home.footerSupport')}</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/" className="hover:text-white transition-colors">{t('home.footerHelp')}</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">{t('home.footerFaq')}</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">{t('home.footerContacts')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">{t('home.footerContacts')}</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="mailto:support@qazaqtamaq.kz" className="hover:text-white transition-colors">support@qazaqtamaq.kz</a></li>
                <li><a href="tel:+77270000000" className="hover:text-white transition-colors">+7 (727) 000-0000</a></li>
                <li className="text-xs text-gray-500 mt-4">{t('home.footerWorkHours')}</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
              <p>{t('home.footerRights')}</p>
              <div className="flex gap-6">
                <Link href="/" className="hover:text-white transition-colors">{t('home.footerTerms')}</Link>
                <Link href="/" className="hover:text-white transition-colors">{t('home.footerPrivacy')}</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
