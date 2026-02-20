'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedPage from '@/components/auth/ProtectedPage';
import toast from 'react-hot-toast';

interface User {
  id: string; email: string; firstName: string; lastName: string;
  role: string; isActive: boolean; createdAt: string;
  _count: { orders: number };
}

function UsersContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = () => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    api.get(`/admin/users${params}&limit=50`).then((r) => setUsers(r.data.users)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleActive = async (u: User) => {
    try {
      await api.patch(`/admin/users/${u.id}`, { isActive: !u.isActive });
      toast.success(u.isActive ? 'User deactivated' : 'User activated');
      fetchUsers();
    } catch {
      toast.error('Error updating user');
    }
  };

  const toggleAdmin = async (u: User) => {
    const newRole = u.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    try {
      await api.patch(`/admin/users/${u.id}`, { role: newRole });
      toast.success(`Role changed to ${newRole}`);
      fetchUsers();
    } catch {
      toast.error('Error updating role');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <form onSubmit={(e) => { e.preventDefault(); setLoading(true); fetchUsers(); }} className="flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email" className="input w-64" />
          <button type="submit" className="btn-primary px-4">Search</button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Orders</th>
                <th className="text-left px-4 py-3">Joined</th>
                <th className="text-left px-4 py-3">Actions</th>
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
                    <span className={`badge ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge bg-blue-100 text-blue-700">{u._count?.orders || 0}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => toggleActive(u)} className={`text-xs px-2 py-1 rounded-lg border font-medium transition-colors ${u.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => toggleAdmin(u)} className="text-xs px-2 py-1 rounded-lg border border-purple-200 text-purple-600 hover:bg-purple-50 font-medium transition-colors">
                        {u.role === 'ADMIN' ? '→ Customer' : '→ Admin'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!users.length && (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No users found</td></tr>
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
