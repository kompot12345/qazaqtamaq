'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
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

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50'
        : 'bg-white/80 backdrop-blur-sm border-b border-gray-100/30'
    }`}>
      <div className="container-custom flex justify-between items-center h-16 md:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0A2540] to-[#0089A7] rounded-xl flex items-center justify-center text-white shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
            <Sparkles size={20} />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-[#0A2540] to-[#00AFCA] bg-clip-text text-transparent">
            QazaqTamaq
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/products" className="text-gray-700 hover:text-[#0A2540] font-medium transition-colors relative group">
            {t('nav.products')}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0A2540] to-[#FFD700] group-hover:w-full transition-all duration-300" />
          </Link>
          <Link href="/gamification" className="text-gray-700 hover:text-[#0A2540] font-medium transition-colors relative group">
            {t('nav.gamification')}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#FFD700] to-[#C9A227] group-hover:w-full transition-all duration-300" />
          </Link>
          {user?.role === 'FARMER' && (
            <Link href="/dashboard" className="text-gray-700 hover:text-[#0A2540] font-medium transition-colors relative group">
              {t('nav.dashboard')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0A2540] to-[#FFD700] group-hover:w-full transition-all duration-300" />
            </Link>
          )}
          {user && (
            <Link href="/orders" className="text-gray-700 hover:text-[#0A2540] font-medium transition-colors relative group">
              {t('nav.orders')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0A2540] to-[#FFD700] group-hover:w-full transition-all duration-300" />
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language switcher */}
          <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
            {LANGS.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  lang === code
                    ? 'bg-[#0A2540] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {!user ? (
            <>
              <Link href="/auth/login" className="btn-ghost">{t('nav.login')}</Link>
              <Link href="/auth/register" className="btn-primary">{t('nav.register')}</Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {/* Cart */}
              <Link href="/cart" className="relative p-2.5 hover:bg-sky-50 rounded-lg transition-all">
                <ShoppingCart size={22} className="text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User info + logout */}
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <Link href="/profile" className="flex items-center gap-2 hover:bg-gray-50 px-3 py-2 rounded-xl transition-all group">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#0A2540] to-[#0089A7] rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900 leading-none">{user.name}</p>
                    <p className="text-xs text-gray-500">{getRoleLabel(user.role)}</p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2.5 hover:bg-red-50 rounded-lg transition-all text-gray-500 hover:text-red-600"
                  title={t('nav.logout')}
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-all"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md py-4 animate-slideUp">
          <div className="container-custom space-y-1">
            {/* Mobile language switcher */}
            <div className="flex items-center gap-1 px-4 py-2 mb-1">
              {LANGS.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    lang === code
                      ? 'bg-[#0A2540] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <Link href="/products" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-sky-50 rounded-xl font-medium transition-colors">
              <Package size={18} className="text-gray-500" /> {t('nav.products')}
            </Link>
            <Link href="/gamification" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-yellow-50 rounded-xl font-medium transition-colors">
              <span>🎮</span> {t('nav.gamificationFull')}
            </Link>
            {user?.role === 'FARMER' && (
              <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-sky-50 rounded-xl font-medium transition-colors">
                <ShoppingBag size={18} className="text-gray-500" /> {t('nav.dashboard')}
              </Link>
            )}
            {user && (
              <>
                <Link href="/orders" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-sky-50 rounded-xl font-medium transition-colors">
                  <ShoppingBag size={18} className="text-gray-500" /> {t('nav.orders')}
                </Link>
                <Link href="/cart" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-sky-50 rounded-xl font-medium transition-colors">
                  <ShoppingCart size={18} className="text-gray-500" />
                  {t('nav.cart')} {cartCount > 0 && <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{cartCount}</span>}
                </Link>
                <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-sky-50 rounded-xl font-medium transition-colors">
                  <User size={18} className="text-gray-500" /> {t('nav.profile')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl text-red-600 font-medium transition-colors"
                >
                  <LogOut size={18} /> {t('nav.logout')}
                </button>
              </>
            )}
            {!user && (
              <>
                <Link href="/auth/login" onClick={() => setIsOpen(false)} className="block px-4 py-3 hover:bg-sky-50 rounded-xl font-medium transition-colors">
                  {t('nav.login')}
                </Link>
                <Link href="/auth/register" onClick={() => setIsOpen(false)} className="block btn-primary text-center mt-2">
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
