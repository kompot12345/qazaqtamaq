'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, Mail, User, Phone, MapPin, Briefcase, Sparkles, ArrowRight, Check } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const DiskCanvas = dynamic(() => import('@/components/three/DiskCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-24 h-24 rounded-full border-4 border-[#FFD700]/40 border-t-[#D4AF37] animate-spin" />
    </div>
  ),
});

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'B2C_BUYER',
    binIin: '',
    address: '',
    city: '',
    phone: '',
  });

  const ROLES = [
    { value: 'B2C_BUYER', labelKey: 'auth.b2cLabel', descKey: 'auth.b2cDesc', icon: '🛒', color: '#D4AF37' },
    { value: 'B2B_BUYER', labelKey: 'auth.b2bLabel', descKey: 'auth.b2bDesc', icon: '🏢', color: '#00AFCA' },
    { value: 'FARMER', labelKey: 'auth.farmerLabel', descKey: 'auth.farmerDesc', icon: '🌾', color: '#0089A7' },
  ];

  const needsExtra = form.role === 'FARMER' || form.role === 'B2B_BUYER';
  const activeRole = ROLES.find((r) => r.value === form.role) ?? ROLES[0];

  const handleRoleSelect = (role: string) => {
    setForm({ ...form, role });
    setTimeout(() => setStep(2), 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error(t('auth.passwordShort'));
      return;
    }
    setLoading(true);
    try {
      await authAPI.register(form);
      toast.success(t('auth.accountCreated'));
      router.push('/auth/login');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t('auth.registerError');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#060D1A] via-[#0A2540] to-[#060D1A] overflow-hidden">
      {/* Left: 3D Identity Disk */}
      <div className="hidden lg:flex flex-col flex-1 items-center justify-center relative p-10">
        <div
          className="absolute inset-0 opacity-20 transition-all duration-700"
          style={{ background: `radial-gradient(ellipse at center, ${activeRole.color}55 0%, transparent 70%)` }}
        />

        <div className="w-72 h-72 relative">
          <DiskCanvas role={form.role} />
        </div>

        <div className="mt-8 text-center transition-all duration-500">
          <p className="text-3xl mb-2">{activeRole.icon}</p>
          <h2 className="text-2xl font-bold transition-colors duration-500" style={{ color: activeRole.color }}>
            {t(activeRole.labelKey)}
          </h2>
          <p className="text-gray-400 text-sm mt-1 max-w-xs">{t(activeRole.descKey)}</p>
        </div>

        <div className="absolute bottom-8 text-center">
          <p className="text-gray-500 text-xs">{t('auth.platformTagline')}</p>
        </div>
      </div>

      {/* Right: Registration Form */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#C9A227] to-[#FFD700] rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles size={20} className="text-[#0A2540]" />
              </div>
              <span className="text-2xl font-bold text-white">QazaqTamaq</span>
            </Link>
            <h1 className="text-3xl font-bold text-white">{t('auth.registerTitle')}</h1>
            <p className="text-gray-400 text-sm mt-1">
              {t('auth.stepOf')} {step} {t('auth.of')} {needsExtra ? 3 : 2}
            </p>
          </div>

          {/* Progress */}
          <div className="flex gap-1.5 mb-8">
            {[1, 2, needsExtra ? 3 : null].filter(Boolean).map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  (step ?? 0) >= (s ?? 0) ? 'bg-[#D4AF37]' : 'bg-white/15'
                }`}
              />
            ))}
          </div>

          <div className="bg-white/8 backdrop-blur-xl border border-white/15 rounded-3xl p-7 shadow-2xl">
            {/* Step 1: Role */}
            {step === 1 && (
              <div className="slide-up">
                <h2 className="text-base font-bold text-white mb-5">{t('auth.roleQuestion')}</h2>
                <div className="space-y-3">
                  {ROLES.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => handleRoleSelect(role.value)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                        form.role === role.value
                          ? 'border-[#FFD700] bg-[#D4AF37]/10'
                          : 'border-white/15 bg-white/5 hover:border-white/30'
                      }`}
                    >
                      <span className="text-2xl">{role.icon}</span>
                      <div className="text-left flex-1">
                        <p className="font-bold text-white text-sm">{t(role.labelKey)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{t(role.descKey)}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          form.role === role.value ? 'border-[#FFD700] bg-[#D4AF37]' : 'border-white/30'
                        }`}
                      >
                        {form.role === role.value && <Check size={11} className="text-[#0A2540]" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Basic Info */}
            {step === 2 && (
              <form
                onSubmit={needsExtra ? (e) => { e.preventDefault(); setStep(3); } : handleSubmit}
                className="slide-up space-y-4"
              >
                <h2 className="text-base font-bold text-white mb-2">{t('auth.basicInfo')}</h2>
                {[
                  { key: 'name', labelKey: 'auth.fullName', type: 'text', icon: User, phKey: 'auth.yourName' },
                  { key: 'email', labelKey: 'auth.email', type: 'email', icon: Mail, phKey: 'auth.email' },
                ].map(({ key, labelKey, type, icon: Icon, phKey }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">{t(labelKey)}</label>
                    <div className="relative">
                      <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type={type}
                        value={(form as any)[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        placeholder={t(phKey)}
                        required
                        className="w-full pl-9 pr-4 py-2.5 bg-white/8 border border-white/15 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FFD700]/70 transition-all"
                      />
                    </div>
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">{t('auth.password')}</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder={t('auth.passwordMin')}
                      required minLength={8}
                      className="w-full pl-9 pr-10 py-2.5 bg-white/8 border border-white/15 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FFD700]/70 transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 py-2.5 border border-white/15 text-white text-sm rounded-xl hover:bg-white/8 transition-all">
                    {t('auth.back')}
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#C9A227] to-[#FFD700] text-[#0A2540] text-sm font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-70">
                    {loading
                      ? <div className="w-4 h-4 border-2 border-[#0A2540]/30 border-t-[#0A2540] rounded-full animate-spin" />
                      : needsExtra
                        ? <><span>{t('auth.next')}</span><ArrowRight size={14} /></>
                        : t('auth.register')}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Business Info */}
            {step === 3 && needsExtra && (
              <form onSubmit={handleSubmit} className="slide-up space-y-4">
                <h2 className="text-base font-bold text-white mb-2">{t('auth.businessInfo')}</h2>
                {[
                  { key: 'binIin', labelKey: 'auth.binIin', type: 'text', icon: Briefcase, phKey: 'auth.binIinPlaceholder', req: true },
                  { key: 'city', labelKey: 'auth.city', type: 'text', icon: MapPin, ph: 'Алматы', req: false },
                  { key: 'address', labelKey: 'auth.address', type: 'text', icon: MapPin, phKey: 'auth.legalAddress', req: true },
                  { key: 'phone', labelKey: 'auth.phone', type: 'tel', icon: Phone, ph: '+7 (777) 000-0000', req: false },
                ].map(({ key, labelKey, type, icon: Icon, ph, phKey, req }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">{t(labelKey)}</label>
                    <div className="relative">
                      <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type={type}
                        value={(form as any)[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        placeholder={phKey ? t(phKey) : ph}
                        required={req}
                        className="w-full pl-9 pr-4 py-2.5 bg-white/8 border border-white/15 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FFD700]/70 transition-all"
                      />
                    </div>
                  </div>
                ))}

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setStep(2)}
                    className="flex-1 py-2.5 border border-white/15 text-white text-sm rounded-xl hover:bg-white/8 transition-all">
                    {t('auth.back')}
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#C9A227] to-[#FFD700] text-[#0A2540] text-sm font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-70">
                    {loading
                      ? <div className="w-4 h-4 border-2 border-[#0A2540]/30 border-t-[#0A2540] rounded-full animate-spin" />
                      : t('auth.register')}
                  </button>
                </div>
              </form>
            )}

            <p className="text-center text-gray-400 text-xs mt-5">
              {t('auth.haveAccount')}{' '}
              <Link href="/auth/login" className="text-[#FFD700] font-semibold hover:underline">
                {t('auth.signIn')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
