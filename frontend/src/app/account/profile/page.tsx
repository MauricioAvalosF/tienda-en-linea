'use client';

import { useEffect, useState } from 'react';
import { User, MapPin, Lock, Plus, Trash2, Star, Pencil, Check, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProtectedPage from '@/components/auth/ProtectedPage';
import toast from 'react-hot-toast';

interface Address {
  id: string;
  label: string;
  street: string;
  numInterior: string | null;
  numExterior: string | null;
  colonia: string | null;
  city: string;
  state: string | null;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  createdAt: string;
  addresses: Address[];
}

type Tab = 'profile' | 'addresses';

type AddrForm = {
  label: string; street: string; numInterior: string; numExterior: string;
  colonia: string; city: string; country: string; postalCode: string; isDefault: boolean;
};

const emptyForm = (): AddrForm => ({
  label: 'Home', street: '', numInterior: '', numExterior: '',
  colonia: '', city: '', country: '', postalCode: '', isDefault: false,
});

function formatAddress(addr: Address) {
  const parts: string[] = [];
  let line1 = addr.street;
  if (addr.numInterior) line1 += ` #${addr.numInterior}`;
  if (addr.numExterior) line1 += `, Ext. ${addr.numExterior}`;
  parts.push(line1);
  if (addr.colonia) parts.push(addr.colonia);
  parts.push(`${addr.city} ${addr.postalCode}`);
  parts.push(addr.country);
  return parts.join(', ');
}

function ProfileContent() {
  const tp = useTranslations('profile');
  const ta = useTranslations('address');
  const tc = useTranslations('common');
  const tauth = useTranslations('auth');
  const { user, fetchMe } = useAuthStore();

  const [tab, setTab] = useState<Tab>('profile');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddr, setNewAddr] = useState<AddrForm>(emptyForm());
  const [addingAddr, setAddingAddr] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAddr, setEditAddr] = useState<AddrForm>(emptyForm());

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/users/profile');
      setProfile(data);
      setFirstName(data.firstName);
      setLastName(data.lastName);
      setPhone(data.phone ?? '');
    } catch {
      toast.error(tc('error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/users/profile', { firstName, lastName, phone: phone || null });
      await fetchMe();
      toast.success(tc('success'));
    } catch {
      toast.error(tc('error'));
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error(tp('newPasswordHint')); return; }
    setPwSaving(true);
    try {
      await api.patch('/users/password', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      toast.success(tc('success'));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg ?? tc('error'));
    } finally {
      setPwSaving(false);
    }
  };

  const addAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.street || !newAddr.numInterior || !newAddr.city || !newAddr.country || !newAddr.postalCode) {
      toast.error(tc('error'));
      return;
    }
    setAddingAddr(true);
    try {
      await api.post('/users/addresses', newAddr);
      setNewAddr(emptyForm());
      setShowAddForm(false);
      await fetchProfile();
      toast.success(tc('success'));
    } catch {
      toast.error(tc('error'));
    } finally {
      setAddingAddr(false);
    }
  };

  const setDefault = async (id: string) => {
    try {
      await api.patch(`/users/addresses/${id}/set-default`);
      await fetchProfile();
      toast.success(tc('success'));
    } catch { toast.error(tc('error')); }
  };

  const startEdit = (addr: Address) => {
    setEditingId(addr.id);
    setEditAddr({
      label: addr.label, street: addr.street,
      numInterior: addr.numInterior ?? '', numExterior: addr.numExterior ?? '',
      colonia: addr.colonia ?? '', city: addr.city, country: addr.country,
      postalCode: addr.postalCode, isDefault: addr.isDefault,
    });
  };

  const saveEdit = async (id: string) => {
    try {
      await api.patch(`/users/addresses/${id}`, editAddr);
      setEditingId(null);
      await fetchProfile();
      toast.success(tc('success'));
    } catch { toast.error(tc('error')); }
  };

  const deleteAddress = async (id: string) => {
    try {
      await api.delete(`/users/addresses/${id}`);
      await fetchProfile();
      toast.success(tc('success'));
    } catch { toast.error(tc('error')); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
        </main>
        <Footer />
      </div>
    );
  }

  const addrFields = (form: AddrForm, set: (f: AddrForm) => void) => (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{ta('label')}</label>
        <input value={form.label} onChange={(e) => set({ ...form, label: e.target.value })} className="input text-sm py-1.5" placeholder={ta('placeholder.label')} />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{ta('street')} *</label>
        <input value={form.street} onChange={(e) => set({ ...form, street: e.target.value })} className="input text-sm py-1.5" placeholder={ta('placeholder.street')} required />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{ta('numInterior')} *</label>
        <input value={form.numInterior} onChange={(e) => set({ ...form, numInterior: e.target.value })} className="input text-sm py-1.5" placeholder={ta('placeholder.numInterior')} required />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{ta('numExteriorOpt')}</label>
        <input value={form.numExterior} onChange={(e) => set({ ...form, numExterior: e.target.value })} className="input text-sm py-1.5" placeholder={ta('placeholder.numExterior')} />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{ta('colonia')}</label>
        <input value={form.colonia} onChange={(e) => set({ ...form, colonia: e.target.value })} className="input text-sm py-1.5" placeholder={ta('placeholder.colonia')} />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{ta('city')} *</label>
        <input value={form.city} onChange={(e) => set({ ...form, city: e.target.value })} className="input text-sm py-1.5" placeholder={ta('placeholder.city')} required />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{ta('postalCode')} *</label>
        <input value={form.postalCode} onChange={(e) => set({ ...form, postalCode: e.target.value })} className="input text-sm py-1.5" placeholder={ta('placeholder.postalCode')} required />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">{ta('country')} *</label>
        <input value={form.country} onChange={(e) => set({ ...form, country: e.target.value })} className="input text-sm py-1.5" placeholder={ta('placeholder.country')} required />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-10 w-full">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold text-xl">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h1>
            <p className="text-sm text-gray-500">{profile?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b dark:border-gray-700 mb-8 gap-1">
          {([['profile', tp('tabProfile'), User], ['addresses', tp('tabAddresses'), MapPin]] as const).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === key
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* ─── Profile Tab ─── */}
        {tab === 'profile' && (
          <div className="space-y-8">
            <div className="card p-6">
              <h2 className="font-semibold text-lg mb-5 flex items-center gap-2">
                <User size={18} className="text-amber-500" /> {tp('personalInfo')}
              </h2>
              <form onSubmit={saveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{tauth('firstName')}</label>
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{tauth('lastName')}</label>
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="input" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{tauth('email')}</label>
                  <input value={profile?.email ?? ''} disabled className="input opacity-60 cursor-not-allowed" />
                  <p className="text-xs text-gray-400 mt-1">{tp('emailNote')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{tauth('phone')}</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="+52 55 0000 0000" />
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={saving} className="btn-primary px-6 disabled:opacity-50">
                    {saving ? tp('saving') : tp('saveChanges')}
                  </button>
                </div>
              </form>
            </div>

            <div className="card p-6">
              <h2 className="font-semibold text-lg mb-5 flex items-center gap-2">
                <Lock size={18} className="text-amber-500" /> {tp('changePassword')}
              </h2>
              <form onSubmit={changePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{tp('currentPassword')}</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{tp('newPassword')}</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input" placeholder={tp('newPasswordHint')} required />
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={pwSaving} className="btn-primary px-6 disabled:opacity-50">
                    {pwSaving ? tp('updating') : tp('updatePassword')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── Addresses Tab ─── */}
        {tab === 'addresses' && (
          <div className="space-y-4">
            {profile?.addresses.length === 0 && !showAddForm && (
              <div className="card p-8 text-center text-gray-400">
                <MapPin size={36} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">{ta('noAddresses')}</p>
              </div>
            )}

            {profile?.addresses.map((addr) => (
              <div key={addr.id} className="card p-4">
                {editingId === addr.id ? (
                  <div className="space-y-3">
                    {addrFields(editAddr, setEditAddr)}
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditingId(null)} className="btn-secondary py-1.5 px-4 text-sm flex items-center gap-1.5">
                        <X size={14} /> {ta('cancel')}
                      </button>
                      <button onClick={() => saveEdit(addr.id)} className="btn-primary py-1.5 px-4 text-sm flex items-center gap-1.5">
                        <Check size={14} /> {ta('save')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                            <Star size={10} className="fill-amber-500 text-amber-500" /> {ta('defaultBadge')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{formatAddress(addr)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!addr.isDefault && (
                        <button
                          onClick={() => setDefault(addr.id)}
                          className="text-xs px-2 py-1 rounded border border-amber-200 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                        >
                          {ta('setDefault')}
                        </button>
                      )}
                      <button onClick={() => startEdit(addr)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => deleteAddress(addr.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {showAddForm ? (
              <div className="card p-5">
                <h3 className="font-semibold mb-4 text-sm">{ta('addNew')}</h3>
                <form onSubmit={addAddress} className="space-y-3">
                  {addrFields(newAddr, setNewAddr)}
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAddr.isDefault}
                      onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    {ta('setDefaultAddress')}
                  </label>
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary py-2 px-4 text-sm flex items-center gap-1.5">
                      <X size={14} /> {ta('cancel')}
                    </button>
                    <button type="submit" disabled={addingAddr} className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5 disabled:opacity-50">
                      <Check size={14} /> {addingAddr ? ta('adding') : ta('saveAddress')}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-500 hover:border-amber-400 hover:text-amber-600 dark:hover:border-amber-500 dark:hover:text-amber-400 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} /> {ta('addNew')}
              </button>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedPage>
      <ProfileContent />
    </ProtectedPage>
  );
}
