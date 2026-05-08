'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { Leaf, Globe, Users, TrendingUp, Check, Zap, Award, Shield } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Product, Category } from '@/types';

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
                  <div key={label} className="text-center">
                    <p className="text-3xl md:text-4xl font-bold text-[#FFD700] mb-1">{val}</p>
                    <p className="text-gray-400 text-sm font-medium">{label}</p>
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
      <section className="py-20 bg-gradient-to-br from-white to-sky-50/50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">{t('home.whyUs')}</h2>
            <p className="section-subtitle max-w-2xl mx-auto">{t('home.whyUsSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { Icon: Leaf, titleKey: 'home.featureFreshTitle', descKey: 'home.featureFreshDesc' },
              { Icon: Globe, titleKey: 'home.featureGlobalTitle', descKey: 'home.featureGlobalDesc' },
              { Icon: Users, titleKey: 'home.featureDirectTitle', descKey: 'home.featureDirectDesc' },
              { Icon: TrendingUp, titleKey: 'home.featurePricingTitle', descKey: 'home.featurePricingDesc' },
            ].map(({ Icon, titleKey, descKey }) => (
              <div key={titleKey} className="card-premium p-8 text-center group hover:border-[#00AFCA]">
                <div className="icon-wrapper mx-auto mb-4">
                  <Icon className="w-8 h-8 text-[#0089A7] group-hover:text-[#C9A227] transition-colors mx-auto" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-[#0A2540]">{t(titleKey)}</h3>
                <p className="text-gray-600 leading-relaxed">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Strip ── */}
      <section className="py-16 bg-[#0A2540]/4 border-y border-[#00AFCA]/20">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { Icon: Award, labelKey: 'home.trustFarmers', subKey: 'home.trustFarmersSub' },
              { Icon: Shield, labelKey: 'home.trustPayment', subKey: 'home.trustPaymentSub' },
              { Icon: Check, labelKey: 'home.trustQuality', subKey: 'home.trustQualitySub' },
              { Icon: Zap, labelKey: 'home.trustDelivery', subKey: 'home.trustDeliverySub' },
            ].map(({ Icon, labelKey, subKey }) => (
              <div key={labelKey} className="flex flex-col items-center text-center">
                <Icon className="w-8 h-8 text-[#FFD700] mb-3" />
                <p className="font-bold text-[#0A2540]">{t(labelKey)}</p>
                <p className="text-sm text-gray-600">{t(subKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-20">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-12">
            <div>
              <h2 className="section-title mb-2">{t('home.featuredTitle')}</h2>
              <p className="section-subtitle">{t('home.featuredSubtitle')}</p>
            </div>
            <Link href="/products" className="btn-accent text-center md:text-left">
              {t('home.viewAll')}
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card animate-pulse h-96" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product: any, idx: number) => (
                <div key={product.id} className="scale-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <Link href={`/products/${product.id}`}>
                    <div className="card-premium overflow-hidden h-full flex flex-col group">
                      {product.imageUrl && (
                        <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden relative">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          {product.discountActive && (
                            <div className="absolute top-4 right-4 badge-accent shadow-lg">{t('home.discount')}</div>
                          )}
                        </div>
                      )}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-lg text-[#0A2540] mb-2 group-hover:text-[#C9A227] transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">{product.category?.name}</p>
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">{t('home.price')}</p>
                            <p className="text-2xl font-bold text-[#0A2540]">
                              {product.price}<span className="text-sm">₸</span>
                            </p>
                          </div>
                          <span className="px-3 py-1.5 bg-gradient-to-r from-sky-100 to-sky-50 text-sky-700 text-xs font-bold rounded-full border border-sky-200">
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
            <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-2xl">
              <p className="text-gray-500 text-lg font-medium">{t('home.noProducts')}</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-sky-50/40 to-white border-t border-[#00AFCA]/15">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="section-title mb-4">{t('home.categoriesTitle')}</h2>
              <p className="section-subtitle">{t('home.categoriesSubtitle')}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category: any, idx: number) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.id}`}
                  className="scale-in"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="card-premium p-6 text-center h-full group hover:bg-gradient-to-br hover:from-[#0A2540] hover:to-[#0D3256] transition-all duration-300">
                    <h3 className="font-bold text-lg text-[#0A2540] group-hover:text-white transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-2 group-hover:text-gray-200 transition-colors">
                        {category.description}
                      </p>
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
