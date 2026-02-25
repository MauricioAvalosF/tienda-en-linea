'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedPage from '@/components/auth/ProtectedPage';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Tag } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  color: string;
}

interface Discount {
  id: string;
  name: string;
  code: string | null;
  type: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  groupId: string | null;
  group: Group | null;
}

interface ModalProps {
  discount: Partial<Discount> | null;
  groups: Group[];
  onClose: () => void;
  onSave: () => void;
}

function DiscountModal({ discount, groups, onClose, onSave }: ModalProps) {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const [form, setForm] = useState({
    name: discount?.name ?? '',
    code: discount?.code ?? '',
    type: discount?.type ?? 'PERCENTAGE',
    value: discount?.value ?? 10,
    minOrderAmount: discount?.minOrderAmount ?? '',
    maxUses: discount?.maxUses ?? '',
    isActive: discount?.isActive !== false,
    startsAt: discount?.startsAt ? discount.startsAt.slice(0, 10) : '',
    expiresAt: discount?.expiresAt ? discount.expiresAt.slice(0, 10) : '',
    groupId: discount?.groupId ?? '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      code: form.code || null,
      minOrderAmount: form.minOrderAmount !== '' ? Number(form.minOrderAmount) : null,
      maxUses: form.maxUses !== '' ? Number(form.maxUses) : null,
      startsAt: form.startsAt || null,
      expiresAt: form.expiresAt || null,
      groupId: form.groupId || null,
    };
    try {
      if (discount?.id) {
        await api.patch(`/admin/discounts/${discount.id}`, payload);
        toast.success(t('discount.updated'));
      } else {
        await api.post('/admin/discounts', payload);
        toast.success(t('discount.created'));
      }
      onSave();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || tc('error'));
    } finally {
      setSaving(false);
    }
  };

  const valueLabel = form.type === 'PERCENTAGE' ? t('discount.valuePct')
    : form.type === 'FIXED' ? t('discount.valueFixed')
    : t('discount.valueFree');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6 mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{discount?.id ? t('discount.edit') : t('discount.new')}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('discount.name')} *</label>
            <input className="input w-full" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder={t('discount.namePlaceholder')} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">{t('discount.type')} *</label>
              <select className="input w-full" value={form.type} onChange={(e) => set('type', e.target.value)}>
                <option value="PERCENTAGE">{t('discount.typePercentage')}</option>
                <option value="FIXED">{t('discount.typeFixed')}</option>
                <option value="FREE_SHIPPING">{t('discount.typeFreeShipping')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{valueLabel}</label>
              <input className="input w-full" type="number" min="0" step="0.01" value={form.value} onChange={(e) => set('value', e.target.value)} disabled={form.type === 'FREE_SHIPPING'} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('discount.couponCode')} <span className="text-gray-400 font-normal">({t('discount.leaveBlank')})</span>
            </label>
            <input className="input w-full uppercase" value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} placeholder="SUMMER20" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('discount.groupRestriction')} <span className="text-gray-400 font-normal">({t('discount.optional')})</span></label>
            <select className="input w-full" value={form.groupId} onChange={(e) => set('groupId', e.target.value)}>
              <option value="">{t('discount.allGroups')}</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">{t('discount.minOrder')}</label>
              <input className="input w-full" type="number" min="0" step="0.01" value={form.minOrderAmount} onChange={(e) => set('minOrderAmount', e.target.value)} placeholder={t('discount.none')} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('discount.maxUses')}</label>
              <input className="input w-full" type="number" min="1" value={form.maxUses} onChange={(e) => set('maxUses', e.target.value)} placeholder={t('discount.unlimited')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">{t('discount.startsAt')}</label>
              <input className="input w-full" type="date" value={form.startsAt} onChange={(e) => set('startsAt', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('discount.expiresAt')}</label>
              <input className="input w-full" type="date" value={form.expiresAt} onChange={(e) => set('expiresAt', e.target.value)} />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="w-4 h-4 accent-amber-500" />
            <span className="text-sm font-medium">{t('discount.active')}</span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary px-4 py-2">{tc('cancel')}</button>
            <button type="submit" disabled={saving} className="btn-primary px-4 py-2">
              {saving ? t('discount.saving') : t('discount.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DiscountsContent() {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Partial<Discount> | null | false>(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([api.get('/admin/discounts'), api.get('/admin/groups')])
      .then(([d, g]) => { setDiscounts(d.data); setGroups(g.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const toggleActive = async (d: Discount) => {
    try {
      await api.patch(`/admin/discounts/${d.id}`, { isActive: !d.isActive });
      toast.success(d.isActive ? t('discount.inactive') : t('discount.active'));
      fetchData();
    } catch {
      toast.error(tc('error'));
    }
  };

  const deleteDiscount = async (d: Discount) => {
    if (!confirm(`${tc('delete')} "${d.name}"?`)) return;
    try {
      await api.delete(`/admin/discounts/${d.id}`);
      toast.success(t('discount.deleted'));
      fetchData();
    } catch {
      toast.error(tc('error'));
    }
  };

  const formatValue = (d: Discount) => {
    if (d.type === 'PERCENTAGE') return `${d.value}%`;
    if (d.type === 'FIXED') return `$${d.value.toFixed(2)}`;
    return t('discount.typeFreeShort');
  };

  const typeLabel: Record<string, string> = {
    PERCENTAGE: t('discount.typePercentageShort'),
    FIXED: t('discount.typeFixedShort'),
    FREE_SHIPPING: t('discount.typeFreeShort'),
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('discount.title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('discount.subtitle')}</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary flex items-center gap-2 px-4 py-2">
          <Plus size={16} /> {t('discount.new')}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-4 py-3">{t('discount.col.nameCode')}</th>
                <th className="text-left px-4 py-3">{t('discount.col.type')}</th>
                <th className="text-left px-4 py-3">{t('discount.col.value')}</th>
                <th className="text-left px-4 py-3">{t('discount.col.group')}</th>
                <th className="text-left px-4 py-3">{t('discount.col.uses')}</th>
                <th className="text-left px-4 py-3">{t('discount.col.expires')}</th>
                <th className="text-left px-4 py-3">{t('discount.col.status')}</th>
                <th className="text-left px-4 py-3">{t('discount.col.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-800">
              {discounts.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{d.name}</p>
                    {d.code ? (
                      <span className="flex items-center gap-1 text-xs text-amber-600 font-mono mt-0.5">
                        <Tag size={11} /> {d.code}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">{t('discount.automatic')}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge bg-blue-100 text-blue-700">{typeLabel[d.type]}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatValue(d)}</td>
                  <td className="px-4 py-3">
                    {d.group ? (
                      <span className="px-2 py-0.5 rounded-full text-white text-xs font-medium" style={{ backgroundColor: d.group.color }}>
                        {d.group.name}
                      </span>
                    ) : (
                      <span className="text-gray-400">{t('discount.allGroups')}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {d.usedCount}{d.maxUses !== null ? `/${d.maxUses}` : ''}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {d.expiresAt ? new Date(d.expiresAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(d)}
                      className={`text-xs px-2 py-1 rounded-full font-medium border transition-colors ${
                        d.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}
                    >
                      {d.isActive ? t('discount.active') : t('discount.inactive')}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setModal(d)} className="text-xs px-2 py-1 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 font-medium transition-colors flex items-center gap-1">
                        <Pencil size={12} /> {tc('edit')}
                      </button>
                      <button onClick={() => deleteDiscount(d)} className="text-xs px-2 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium transition-colors flex items-center gap-1">
                        <Trash2 size={12} /> {tc('delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!discounts.length && (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">{t('discount.noDiscounts')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal !== false && (
        <DiscountModal
          discount={modal}
          groups={groups}
          onClose={() => setModal(false)}
          onSave={() => { setModal(false); fetchData(); }}
        />
      )}
    </>
  );
}

export default function AdminDiscountsPage() {
  return (
    <ProtectedPage requireAdmin>
      <AdminLayout>
        <DiscountsContent />
      </AdminLayout>
    </ProtectedPage>
  );
}
