'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedPage from '@/components/auth/ProtectedPage';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

interface Group {
  id: string;
  name: string;
  color: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  group: Group | null;
  _count: { orders: number };
}

function UsersContent() {
  const t = useTranslations('admin');
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user: currentUser } = useAuthStore();
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const fetchData = (q = '') => {
    setLoading(true);
    const params = q ? `?search=${encodeURIComponent(q)}&limit=50` : '?limit=50';
    Promise.all([
      api.get(`/admin/users${params}`),
      api.get('/admin/groups'),
    ]).then(([u, g]) => {
      setUsers(u.data.users);
      setGroups(g.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const toggleActive = async (u: User) => {
    try {
      await api.patch(`/admin/users/${u.id}`, { isActive: !u.isActive });
      toast.success(u.isActive ? t('user.deactivated') : t('user.activated'));
      fetchData(search);
    } catch {
      toast.error('Error');
    }
  };

  const toggleAdmin = async (u: User) => {
    const newRole = u.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    try {
      await api.patch(`/admin/users/${u.id}`, { role: newRole });
      toast.success(`→ ${newRole}`);
      fetchData(search);
    } catch {
      toast.error('Error');
    }
  };

  const changeGroup = async (u: User, groupId: string) => {
    try {
      await api.patch(`/admin/users/${u.id}`, { groupId: groupId || null });
      toast.success(t('user.groupUpdated'));
      fetchData(search);
    } catch {
      toast.error('Error');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('user.title')}</h1>
        <form
          onSubmit={(e) => { e.preventDefault(); setLoading(true); fetchData(search); }}
          className="flex gap-2"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('user.searchPlaceholder')}
            className="input w-64"
          />
          <button type="submit" className="btn-primary px-4">{t('user.search')}</button>
        </form>
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
                <th className="text-left px-4 py-3">{t('user.col.user')}</th>
                <th className="text-left px-4 py-3">{t('user.col.email')}</th>
                <th className="text-left px-4 py-3">{t('user.col.role')}</th>
                <th className="text-left px-4 py-3">{t('user.col.group')}</th>
                <th className="text-left px-4 py-3">{t('user.col.orders')}</th>
                <th className="text-left px-4 py-3">{t('user.col.joined')}</th>
                <th className="text-left px-4 py-3">{t('user.col.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{u.firstName} {u.lastName}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${
                      u.role === 'SUPER_ADMIN' ? 'bg-amber-100 text-amber-700' :
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role === 'SUPER_ADMIN' ? 'Super Admin' : u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.group?.id ?? ''}
                      onChange={(e) => changeGroup(u, e.target.value)}
                      className="text-xs border rounded-lg px-2 py-1 bg-white dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="">{t('user.noGroup')}</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                    {u.group && (
                      <span
                        className="ml-2 inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: u.group.color }}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge bg-blue-100 text-blue-700">{u._count?.orders || 0}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleActive(u)}
                        className={`text-xs px-2 py-1 rounded-lg border font-medium transition-colors ${
                          u.isActive
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-green-200 text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {u.isActive ? t('user.deactivate') : t('user.activate')}
                      </button>
                      {isSuperAdmin && u.role !== 'SUPER_ADMIN' && (
                        <button
                          onClick={() => toggleAdmin(u)}
                          className="text-xs px-2 py-1 rounded-lg border border-purple-200 text-purple-600 hover:bg-purple-50 font-medium transition-colors"
                        >
                          {u.role === 'ADMIN' ? '→ Customer' : '→ Admin'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!users.length && (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">{t('user.noUsers')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function AdminUsersPage() {
  return (
    <ProtectedPage requireAdmin>
      <AdminLayout>
        <UsersContent />
      </AdminLayout>
    </ProtectedPage>
  );
}
