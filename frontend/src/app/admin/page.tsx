'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Package, ShoppingCart, Users, DollarSign, TrendingDown } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import AdminLayout from '@/components/admin/AdminLayout';

interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  lowStock: Array<{
    id: string;
    name: string;
    stock: number;
    imageUrls: string[];
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function AdminDashboard() {
  const t = useTranslations('admin');
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (user.role !== 'ADMIN') { router.push('/'); return; }

    api.get('/admin/stats')
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, router]);

  if (loading) return <AdminLayout><div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-8">{t('dashboard')}</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: t('stats.revenue'), value: `$${Number(stats?.totalRevenue || 0).toFixed(2)}`, icon: DollarSign, color: 'text-green-600 bg-green-100' },
          { label: t('stats.orders'), value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'text-blue-600 bg-blue-100' },
          { label: t('stats.customers'), value: stats?.totalUsers || 0, icon: Users, color: 'text-purple-600 bg-purple-100' },
          { label: t('stats.products'), value: stats?.totalProducts || 0, icon: Package, color: 'text-orange-600 bg-orange-100' },
        ].map((s) => (
          <div key={s.label} className="card p-6 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${s.color}`}>
              <s.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {stats?.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">#{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                    {order.status}
                  </span>
                  <span className="font-semibold">${Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            ))}
            {!stats?.recentOrders.length && <p className="text-gray-500 text-sm">No orders yet</p>}
          </div>
        </div>

        {/* Low Stock */}
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <TrendingDown size={18} className="text-red-500" />
            Low Stock Alert
          </h2>
          <div className="space-y-3">
            {stats?.lowStock.map((product) => (
              <div key={product.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                  {product.imageUrls?.[0] && (
                    <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                </div>
                <span className={`badge ${product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {product.stock} left
                </span>
              </div>
            ))}
            {!stats?.lowStock.length && <p className="text-gray-500 text-sm">All products have sufficient stock</p>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
