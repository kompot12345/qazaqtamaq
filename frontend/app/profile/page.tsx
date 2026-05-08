'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, Briefcase, Shield, Edit2, Save, X, ShoppingBag, Package } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { getStoredUser } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';

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
      <div className="min-h-screen bg-gradient-to-br from-white to-sky-50/30">
        <div className="bg-gradient-to-br from-[#0A2540] to-[#0D3256] py-14">
          <div className="container-custom"><div className="h-10 w-48 bg-white/20 rounded animate-pulse" /></div>
        </div>
        <div className="container-custom py-10 max-w-2xl">
          <div className="card p-8 space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse shimmer" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const roleColor: Record<string, string> = {
    FARMER: 'bg-sky-100 text-sky-800',
    B2B_BUYER: 'bg-blue-100 text-blue-800',
    B2C_BUYER: 'bg-purple-100 text-purple-800',
    ADMIN: 'bg-red-100 text-red-800',
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

  const quickLinks = [
    user.role === 'FARMER' ? { href: '/dashboard', label: t('profile.farmerDashboard'), icon: Package } : null,
    { href: '/orders', label: t('profile.myOrders'), icon: ShoppingBag },
    { href: '/products', label: t('profile.catalogue'), icon: Package },
  ].filter(Boolean) as { href: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-sky-50/30">
      <div className="bg-gradient-to-br from-[#0A2540] to-[#0D3256] py-14">
        <div className="container-custom">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <User size={40} /> {t('profile.title')}
          </h1>
        </div>
      </div>

      <div className="container-custom py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl">
          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#0A2540] to-[#0D3256] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-3xl font-bold shadow-lg">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <h2 className="text-xl font-bold text-[#0A2540] mb-1">{user.name}</h2>
              <span className={`inline-block text-sm font-bold px-3 py-1 rounded-full ${roleColor[user.role] || 'bg-gray-100 text-gray-700'}`}>
                {getRoleLabel(user.role)}
              </span>
              {user.isVerified && (
                <div className="flex items-center justify-center gap-1 mt-3">
                  <Shield size={14} className="text-[#00AFCA]" />
                  <span className="text-xs text-[#00AFCA] font-semibold">{t('profile.verified')}</span>
                </div>
              )}
            </div>

            <div className="card p-4">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 px-2">{t('profile.quickLinks')}</p>
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sky-50 transition-colors group">
                  <link.icon size={18} className="text-gray-500 group-hover:text-[#0A2540]" />
                  <span className="font-medium text-gray-700 group-hover:text-[#0A2540]">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Main */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#0A2540]">{t('profile.personalData')}</h2>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-2 text-sm font-semibold text-[#0A2540] border border-gray-200 px-4 py-2 rounded-xl hover:bg-sky-50 transition-all">
                    <Edit2 size={15} /> {t('profile.edit')}
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(false); setForm(user); }} className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all">
                      <X size={15} /> {t('profile.cancel')}
                    </button>
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 text-sm btn-primary py-2">
                      {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
                      {t('profile.save')}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2"><User size={15} /> {t('profile.name')}</label>
                  {editing ? (
                    <input type="text" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
                  ) : (
                    <p className="text-[#0A2540] font-medium py-3 px-4 bg-gray-50 rounded-xl">{user.name}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2"><Mail size={15} /> {t('profile.email')}</label>
                  <p className="text-gray-500 font-medium py-3 px-4 bg-gray-50 rounded-xl">{user.email}</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2"><Phone size={15} /> {t('profile.phone')}</label>
                  {editing ? (
                    <input type="tel" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+7 (777) 000-0000" className="input-field" />
                  ) : (
                    <p className="font-medium py-3 px-4 bg-gray-50 rounded-xl">{user.phone || <span className="text-gray-400 italic">{t('profile.notSet')}</span>}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2"><MapPin size={15} /> {t('profile.city')}</label>
                  {editing ? (
                    <input type="text" value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Алматы" className="input-field" />
                  ) : (
                    <p className="font-medium py-3 px-4 bg-gray-50 rounded-xl">{user.city || <span className="text-gray-400 italic">{t('profile.notSet')}</span>}</p>
                  )}
                </div>

                {(user.role === 'FARMER' || user.role === 'B2B_BUYER') && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2"><Briefcase size={15} /> {t('profile.binIin')}</label>
                    <p className="font-medium py-3 px-4 bg-gray-50 rounded-xl">{user.binIin || <span className="text-gray-400 italic">{t('profile.notSet')}</span>}</p>
                  </div>
                )}

                {user.address && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2"><MapPin size={15} /> {t('profile.address')}</label>
                    <p className="font-medium py-3 px-4 bg-gray-50 rounded-xl">{user.address}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
