'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedPage from '@/components/auth/ProtectedPage';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description: string | null;
  color: string;
  _count: { users: number };
}

const DEFAULT_COLORS = [
  '#6B7280', '#F59E0B', '#8B5CF6', '#10B981', '#3B82F6',
  '#EF4444', '#EC4899', '#F97316', '#14B8A6', '#6366F1',
];

interface ModalProps {
  group: Partial<Group> | null;
  onClose: () => void;
  onSave: () => void;
}

function GroupModal({ group, onClose, onSave }: ModalProps) {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const [name, setName] = useState(group?.name ?? '');
  const [description, setDescription] = useState(group?.description ?? '');
  const [color, setColor] = useState(group?.color ?? '#6B7280');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (group?.id) {
        await api.patch(`/admin/groups/${group.id}`, { name, description, color });
        toast.success(t('group.updated'));
      } else {
        await api.post('/admin/groups', { name, description, color });
        toast.success(t('group.created'));
      }
      onSave();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || tc('error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{group?.id ? t('group.edit') : t('group.new')}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('group.name')} *</label>
            <input
              className="input w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('group.namePlaceholder')}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('group.description')}</label>
            <input
              className="input w-full"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('group.descPlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{t('group.badgeColor')}</label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                  style={{ backgroundColor: c, borderColor: color === c ? '#111' : 'transparent' }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border"
              />
              <span className="text-sm text-gray-500">{color}</span>
              <span className="px-2 py-0.5 rounded-full text-white text-xs font-medium" style={{ backgroundColor: color }}>
                {t('group.preview')}
              </span>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary px-4 py-2">{tc('cancel')}</button>
            <button type="submit" disabled={saving} className="btn-primary px-4 py-2">
              {saving ? t('group.saving') : t('group.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GroupsContent() {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Partial<Group> | null | false>(false);

  const fetchGroups = () => {
    setLoading(true);
    api.get('/admin/groups').then((r) => setGroups(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchGroups(); }, []);

  const deleteGroup = async (g: Group) => {
    if (g._count.users > 0) {
      toast.error(`"${g.name}" — ${t('group.noGroups')}`);
      return;
    }
    if (!confirm(`${tc('delete')} "${g.name}"?`)) return;
    try {
      await api.delete(`/admin/groups/${g.id}`);
      toast.success(t('group.deleted'));
      fetchGroups();
    } catch {
      toast.error('Error');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('group.title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('group.subtitle')}</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary flex items-center gap-2 px-4 py-2">
          <Plus size={16} /> {t('group.new')}
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
                <th className="text-left px-4 py-3">{t('group.col.group')}</th>
                <th className="text-left px-4 py-3">{t('group.col.description')}</th>
                <th className="text-left px-4 py-3">{t('group.col.members')}</th>
                <th className="text-left px-4 py-3">{t('group.col.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-800">
              {groups.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-full text-white text-xs font-semibold" style={{ backgroundColor: g.color }}>
                      {g.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{g.description || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="badge bg-blue-100 text-blue-700">{g._count.users}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setModal(g)}
                        className="text-xs px-2 py-1 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 font-medium transition-colors flex items-center gap-1"
                      >
                        <Pencil size={12} /> {tc('edit')}
                      </button>
                      <button
                        onClick={() => deleteGroup(g)}
                        className="text-xs px-2 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={12} /> {tc('delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!groups.length && (
                <tr><td colSpan={4} className="text-center py-10 text-gray-400">{t('group.noGroups')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal !== false && (
        <GroupModal
          group={modal}
          onClose={() => setModal(false)}
          onSave={() => { setModal(false); fetchGroups(); }}
        />
      )}
    </>
  );
}

export default function AdminGroupsPage() {
  return (
    <ProtectedPage requireAdmin>
      <AdminLayout>
        <GroupsContent />
      </AdminLayout>
    </ProtectedPage>
  );
}
