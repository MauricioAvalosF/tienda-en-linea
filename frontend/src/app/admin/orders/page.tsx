'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedPage from '@/components/auth/ProtectedPage';
import toast from 'react-hot-toast';

interface Order {
  id: string; status: string; total: number; createdAt: string;
  user: { firstName: string; lastName: string; email: string };
  items: Array<{ id: string; quantity: number; product: { name: string } }>;
}

const STATUSES = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800', PAID: 'bg-green-100 text-green-800',
  PROCESSING: 'bg-blue-100 text-blue-800', SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-gray-100 text-gray-700', CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-orange-100 text-orange-700',
};

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchOrders = () => {
    const params = filter ? `?status=${filter}` : '';
    api.get(`/admin/orders${params}&limit=50`).then((r) => setOrders(r.data.orders)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status });
      toast.success('Order updated');
      fetchOrders();
    } catch {
      toast.error('Error updating order');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-48">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-4 py-3">Order</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Items</th>
                <th className="text-left px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Change Status</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-800">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <p className="font-medium">#{o.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.user?.firstName} {o.user?.lastName}</p>
                    <p className="text-xs text-gray-400">{o.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {o.items?.map((i) => `${i.product.name} ×${i.quantity}`).join(', ')}
                  </td>
                  <td className="px-4 py-3 font-bold">${Number(o.total).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-700'}`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="input text-xs py-1 w-36"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {!orders.length && (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function AdminOrdersPage() {
  return (
    <ProtectedPage requireAdmin>
      <AdminLayout>
        <OrdersContent />
      </AdminLayout>
    </ProtectedPage>
  );
}
