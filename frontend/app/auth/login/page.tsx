'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, Mail, Sparkles, ArrowRight } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const { accessToken, user } = res.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success(`${t('auth.loginWelcome').replace('!', ',')} ${user.name}!`);
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t('auth.invalidCredentials');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A2540] via-[#0D3256] to-[#060D1A] relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#FFD700] rounded-full mix-blend-screen blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#00AFCA] rounded-full mix-blend-screen blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8 slide-up">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#C9A227] to-[#FFD700] rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles size={24} className="text-[#0A2540]" />
            </div>
            <span className="text-3xl font-bold text-white">QazaqTamaq</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">{t('auth.loginWelcome')}</h1>
          <p className="text-gray-300">{t('auth.loginSubtitle')}</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl slide-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">{t('auth.email')}</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="farmer@qazaqtamaq.kz"
                  required
                  className="input-dark w-full pl-11 pr-4 py-3.5 border border-white/20 rounded-xl focus:outline-none focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/30 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">{t('auth.password')}</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="input-dark w-full pl-11 pr-12 py-3.5 border border-white/20 rounded-xl focus:outline-none focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#C9A227] to-[#FFD700] text-[#0A2540] font-bold rounded-xl hover:shadow-lg hover:shadow-yellow-500/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#0A2540]/30 border-t-[#0A2540] rounded-full animate-spin" />
              ) : (
                <>{t('auth.signIn')} <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-xs text-gray-400 font-semibold mb-2">{t('auth.demoAccounts')}</p>
            <div className="space-y-1 text-xs text-gray-300">
              <p>{t('auth.farmer')}: <span className="text-[#FFD700]">farmer@qazaqtamaq.kz</span> / password123</p>
              <p>{t('auth.buyer')}: <span className="text-[#FFD700]">ayagoz@gmail.com</span> / buyer123</p>
            </div>
          </div>

          <p className="text-center text-gray-300 text-sm mt-6">
            {t('auth.noAccount')}{' '}
            <Link href="/auth/register" className="text-[#FFD700] font-semibold hover:underline">
              {t('auth.register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
