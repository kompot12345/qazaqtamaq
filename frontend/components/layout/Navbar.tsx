'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Menu, X, LogOut, ShoppingCart, Sparkles, User, Package, ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Language } from '@/lib/i18n/translations';

const LANGS: { code: Language; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'kk', label: 'ҚАЗ' },
];

export function Navbar() {
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<Record<string, string> | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const activeLangIdx = LANGS.findIndex((l) => l.code === lang);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const refreshState = () => {
    const storedUser = localStorage.getItem('user');
    setUser(storedUser ? JSON.parse(storedUser) : null);
    const cart = localStorage.getItem('cart');
    setCartCount(cart ? JSON.parse(cart).length : 0);
  };

  useEffect(() => {
    refreshState();
    window.addEventListener('cartUpdated', refreshState);
    window.addEventListener('storage', refreshState);
    return () => {
      window.removeEventListener('cartUpdated', refreshState);
      window.removeEventListener('storage', refreshState);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    setUser(null);
    setCartCount(0);
    setIsOpen(false);
    toast.success(t('nav.loggedOut'));
    router.push('/');
  };

  const getRoleLabel = (role: string) => {
    const map: Record<string, string> = {
      FARMER: t('roles.FARMER'),
      B2B_BUYER: t('roles.B2B_BUYER'),
      B2C_BUYER: t('roles.B2C_BUYER'),
      ADMIN: t('roles.ADMIN'),
    };
    return map[role] || role;
  };

  const navLinks = [
    { href: '/products', labelKey: 'nav.products', show: true },
    { href: '/gamification', labelKey: 'nav.gamification', show: true },
    { href: '/dashboard', labelKey: 'nav.dashboard', show: user?.role === 'FARMER' },
    { href: '/orders', labelKey: 'nav.orders', show: !!user },
  ].filter((l) => l.show);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#050D1A]/92 backdrop-blur-2xl border-b border-[#00AFCA]/25 shadow-[0_4px_40px_rgba(0,0,0,0.5)]'
          : 'bg-[#050D1A]/70 backdrop-blur-xl border-b border-white/5'
      }`}
    >
      <div className="container-custom flex justify-between items-center h-16 md:h-[72px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="relative w-9 h-9 flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[#C9A227] to-[#00AFCA] rounded-xl opacity-0 group-hover:opacity-60 blur-md transition-all duration-500" />
            <div className="relative w-9 h-9 bg-gradient-to-br from-[#0A2540] to-[#0D3256] rounded-xl flex items-center justify-center border border-white/10 group-hover:border-[#FFD700]/40 transition-colors duration-300">
              <Sparkles
                size={17}
                className="text-[#FFD700] transition-transform duration-300 group-hover:rotate-[20deg]"
              />
            </div>
          </div>
          <span
            className="text-xl font-black hidden sm:block tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #C9A227 40%, #00AFCA 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            QazaqTamaq
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map(({ href, labelKey }) => (
            <Link
              key={href}
              href={href}
              className="relative px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors duration-200 group rounded-lg hover:bg-white/5"
            >
              {t(labelKey)}
              <span className="absolute bottom-1 left-4 right-4 h-px bg-gradient-to-r from-[#FFD700] to-[#00AFCA] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Language switcher with sliding indicator */}
          <div className="relative flex items-center gap-0.5 bg-white/5 border border-white/8 rounded-lg p-0.5 overflow-hidden">
            <div
              className="absolute top-0.5 bottom-0.5 rounded-md border border-[#C9A227]/35 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(201,162,39,0.2), rgba(0,175,202,0.1))',
                width: `calc(${100 / LANGS.length}% - 2px)`,
                left: `calc(2px + ${activeLangIdx * (100 / LANGS.length)}%)`,
              }}
            />
            {LANGS.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`relative z-10 px-2.5 py-1.5 text-[11px] font-bold rounded-md transition-all duration-200 min-w-[30px] ${
                  lang === code ? 'text-[#FFD700]' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {!user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white border border-white/12 hover:border-white/25 rounded-xl transition-all duration-200 hover:bg-white/5"
              >
                {t('nav.login')}
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 text-sm font-bold text-[#0A2540] rounded-xl transition-all duration-200 hover:shadow-[0_0_24px_rgba(201,162,39,0.5)] hover:scale-[1.03] active:scale-95"
                style={{ background: 'linear-gradient(135deg, #C9A227, #FFD700)' }}
              >
                {t('nav.register')}
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2.5 hover:bg-white/8 rounded-xl transition-all duration-200 group"
              >
                <ShoppingCart
                  size={19}
                  className="text-gray-400 group-hover:text-white transition-colors duration-200"
                />
                {cartCount > 0 && (
                  <span
                    key={cartCount}
                    className="badge-pop absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] bg-gradient-to-r from-[#C9A227] to-[#FFD700] text-[#0A2540] text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-lg"
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              <div className="w-px h-5 bg-white/10" />

              {/* User */}
              <Link
                href="/profile"
                className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-white/6 rounded-xl transition-all duration-200 group"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-black flex-shrink-0 ring-1 ring-white/10 group-hover:ring-[#00AFCA]/40 transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg, #0A2540, #0089A7)' }}
                >
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-[11px] font-bold text-white leading-none">{user.name}</p>
                  <p className="text-[9px] text-[#00AFCA] leading-none mt-0.5 font-semibold">{getRoleLabel(user.role)}</p>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2.5 hover:bg-red-500/12 rounded-xl transition-all duration-200 text-gray-600 hover:text-red-400"
                title={t('nav.logout')}
              >
                <LogOut size={17} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2.5 hover:bg-white/8 rounded-xl transition-all text-gray-300"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/8 bg-[#060D1A]/98 backdrop-blur-2xl py-4 animate-slideUp">
          <div className="container-custom space-y-1">
            {/* Mobile language */}
            <div className="flex gap-1 px-2 pb-3 border-b border-white/8 mb-2">
              {LANGS.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                    lang === code
                      ? 'text-[#FFD700] border border-[#C9A227]/40'
                      : 'text-gray-500 border border-transparent hover:text-gray-300 hover:bg-white/5'
                  }`}
                  style={
                    lang === code
                      ? { background: 'linear-gradient(135deg, rgba(201,162,39,0.15), rgba(0,175,202,0.08))' }
                      : {}
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            {navLinks.map(({ href, labelKey }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-gray-300 hover:text-white font-medium transition-all duration-200"
              >
                {t(labelKey)}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  href="/cart"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-gray-300 hover:text-white font-medium transition-all duration-200"
                >
                  <ShoppingCart size={18} className="text-gray-500" />
                  {t('nav.cart')}
                  {cartCount > 0 && (
                    <span className="ml-auto bg-gradient-to-r from-[#C9A227] to-[#FFD700] text-[#0A2540] text-[10px] font-black px-2 py-0.5 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl text-gray-300 hover:text-white font-medium transition-all duration-200"
                >
                  <User size={18} className="text-gray-500" /> {t('nav.profile')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 rounded-xl text-red-400 font-medium transition-all duration-200"
                >
                  <LogOut size={18} /> {t('nav.logout')}
                </button>
              </>
            ) : (
              <div className="pt-2 space-y-2 px-2">
                <Link
                  href="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-center border border-white/15 hover:border-white/30 rounded-xl text-gray-300 hover:text-white font-semibold transition-all duration-200"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-center font-bold text-[#0A2540] rounded-xl hover:shadow-[0_0_20px_rgba(201,162,39,0.4)] transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg, #C9A227, #FFD700)' }}
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
