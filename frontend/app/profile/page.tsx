'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  User, Mail, Phone, MapPin, Briefcase, Shield,
  Edit2, Save, X, ShoppingBag, Package, LayoutDashboard,
} from 'lucide-react';
import { authAPI } from '@/lib/api';
import { getStoredUser } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const ROLE_STYLE: Record<string, { pill: string; dot: string }> = {
  FARMER:    { pill: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30', dot: 'bg-emerald-400' },
  B2B_BUYER: { pill: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',         dot: 'bg-blue-400' },
  B2C_BUYER: { pill: 'bg-[#00AFCA]/15 text-[#7DD8E8] border border-[#00AFCA]/30',      dot: 'bg-[#00AFCA]' },
  ADMIN:     { pill: 'bg-red-500/15 text-red-400 border border-red-500/30',             dot: 'bg-red-400' },
};

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState<Record<string, string> | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) { router.push('/auth/login'); return; }
    authAPI.getCurrentUser()
      .then((res) => {
        setUser(res.data);
        setForm(res.data);
      })
      .catch(() => {
        setUser(storedUser);
        setForm(storedUser);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      toast.success(t('profile.saved'));
      setUser(form);
      localStorage.setItem('user', JSON.stringify({ ...user, ...form }));
      setEditing(false);
    } catch {
      toast.error(t('profile.saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060D1A]">
        <div className="bg-gradient-to-br from-[#0A2540] to-[#0D3256] py-14">
          <div className="container-custom"><div className="h-10 w-48 bg-white/20 rounded animate-pulse" /></div>
        </div>
        <div className="container-custom py-10 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-56 rounded-2xl bg-white/[0.04] animate-pulse" />
            <div className="lg:col-span-2 h-96 rounded-2xl bg-white/[0.04] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const roleStyle = ROLE_STYLE[user.role] ?? { pill: 'bg-gray-500/15 text-gray-400 border border-gray-500/30', dot: 'bg-gray-400' };

  const getRoleLabel = (role: string) => {
    const map: Record<string, string> = {
      FARMER: t('roles.FARMER'),
      B2B_BUYER: t('roles.B2B_BUYER'),
      B2C_BUYER: t('roles.B2C_BUYER'),
      ADMIN: t('roles.ADMIN'),
    };
    return map[role] || role;
  };

  const quickLinks = [
    user.role === 'FARMER' ? { href: '/dashboard', label: t('profile.farmerDashboard'), Icon: LayoutDashboard } : null,
    { href: '/orders', label: t('profile.myOrders'), Icon: ShoppingBag },
    { href: '/products', label: t('profile.catalogue'), Icon: Package },
  ].filter(Boolean) as { href: string; label: string; Icon: React.ComponentType<{ size?: number; className?: string }> }[];

  const fields = [
    { key: 'name', label: t('profile.name'), Icon: User, editable: true, type: 'text', placeholder: '' },
    { key: 'email', label: t('profile.email'), Icon: Mail, editable: false, type: 'email', placeholder: '' },
    { key: 'phone', label: t('profile.phone'), Icon: Phone, editable: true, type: 'tel', placeholder: '+7 (777) 000-0000' },
    { key: 'city', label: t('profile.city'), Icon: MapPin, editable: true, type: 'text', placeholder: 'Алматы' },
    ...(user.role === 'FARMER' || user.role === 'B2B_BUYER'
      ? [{ key: 'binIin', label: t('profile.binIin'), Icon: Briefcase, editable: false, type: 'text', placeholder: '' }]
      : []),
    ...(user.address ? [{ key: 'address', label: t('profile.address'), Icon: MapPin, editable: true, type: 'text', placeholder: '' }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#060D1A]">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0A2540] via-[#0D3256] to-[#060D1A] py-14">
        <div className="absolute top-0 left-1/3 w-72 h-72 bg-[#00AFCA]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="container-custom relative z-10">
          <p className="text-[#C9A227] text-[10px] font-black tracking-[0.2em] mb-3">MY ACCOUNT</p>
          <h1 className="text-4xl font-black text-white flex items-center gap-3 tracking-tight">
            <User size={36} className="text-[#C9A227]" />
            {t('profile.title')}
          </h1>
        </div>
      </div>

      <div className="container-custom py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Avatar card */}
            <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 text-center">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white text-3xl font-black shadow-lg ring-2 ring-white/10"
                style={{ background: 'linear-gradient(135deg, #0A2540, #0089A7)' }}
              >
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <h2 className="text-lg font-bold text-white mb-2">{user.name}</h2>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${roleStyle.pill}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${roleStyle.dot}`} />
                {getRoleLabel(user.role)}
              </span>
              {user.isVerified && (
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <Shield size={13} className="text-[#00AFCA]" />
                  <span className="text-xs text-[#00AFCA] font-semibold">{t('profile.verified')}</span>
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-4">
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 px-2">
                {t('profile.quickLinks')}
              </p>
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/6 transition-colors group"
                >
                  <link.Icon size={16} className="text-gray-600 group-hover:text-[#00AFCA] transition-colors" />
                  <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Main card */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-7">
              <div className="flex items-center justify-between mb-7">
                <h2 className="text-lg font-bold text-white">{t('profile.personalData')}</h2>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white border border-white/10 hover:border-white/25 px-3.5 py-2 rounded-xl transition-all"
                  >
                    <Edit2 size={13} /> {t('profile.edit')}
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditing(false); setForm(user); }}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white border border-white/10 px-3.5 py-2 rounded-xl hover:bg-white/5 transition-all"
                    >
                      <X size={13} /> {t('profile.cancel')}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#0A2540] px-3.5 py-2 rounded-xl transition-all hover:shadow-[0_0_16px_rgba(201,162,39,0.4)] disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, #C9A227, #FFD700)' }}
                    >
                      {saving
                        ? <div className="w-3.5 h-3.5 border-2 border-[#0A2540]/30 border-t-[#0A2540] rounded-full animate-spin" />
                        : <Save size={13} />}
                      {t('profile.save')}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {fields.map(({ key, label, Icon, editable, type, placeholder }) => (
                  <div key={key}>
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                      <Icon size={12} /> {label}
                    </label>
                    {editing && editable ? (
                      <input
                        type={type}
                        value={form[key] || ''}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 bg-white/6 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#00AFCA]/50 focus:bg-white/8 transition-all"
                      />
                    ) : (
                      <p className="text-sm font-medium py-3 px-4 bg-white/[0.03] border border-white/6 rounded-xl text-gray-300">
                        {user[key] || <span className="text-gray-600 italic">{t('profile.notSet')}</span>}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
