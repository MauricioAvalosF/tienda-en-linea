'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, Package, CreditCard, Tag, User } from 'lucide-react';
import { api } from '@/lib/api';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedPage from '@/components/auth/ProtectedPage';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
  items: Array<{ id: string; quantity: number; product: { name: string } }>;
}

interface OrderDetail {
  id: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  discountCode: string | null;
  discountAmount: number | null;
  stripeSessionId: string | null;
  stripePaymentId: string | null;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    total: number;
    product: { name: string; nameEs: string; imageUrls: string[]; slug: string; price: number };
  }>;
  address: { street: string; city: string; state: string; country: string; postalCode: string } | null;
}

const STATUSES = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-orange-100 text-orange-700',
};

function OrderDetailModal({ orderId, onClose, onStatusUpdate }: {
  orderId: string;
  onClose: () => void;
  onStatusUpdate: () => void;
}) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/admin/orders/${orderId}`)
      .then((r) => setOrder(r.data))
      .finally(() => setLoading(false));
  }, [orderId]);

  const updateStatus = async (status: string) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status });
      setOrder((prev) => prev ? { ...prev, status } : null);
      onStatusUpdate();
      toast.success('Order status updated');
    } catch {
      toast.error('Error updating order');
    }
  };

  const isTestOrder = order?.stripeSessionId?.startsWith('test_');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          {loading || !order ? (
            <div className="animate-pulse h-6 bg-gray-200 dark:bg-gray-700 rounded w-48" />
          ) : (
            <div>
              <p className="font-bold text-lg">Order #{order.id.slice(-8).toUpperCase()}</p>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          )}
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
          </div>
        ) : order ? (
          <div className="p-6 space-y-6">
            {/* Customer */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide">
                <User size={13} /> Customer
              </h3>
              <p className="font-medium">{order.user.firstName} {order.user.lastName}</p>
              <p className="text-sm text-gray-500">{order.user.email}</p>
            </div>

            {/* Status change */}
            <div className="flex items-center gap-3">
              <span className={`badge px-3 py-1 ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                {order.status}
              </span>
              <select
                value={order.status}
                onChange={(e) => updateStatus(e.target.value)}
                className="input text-sm py-1 w-44"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Items */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide">
                <Package size={13} /> Items
              </h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {item.product.imageUrls?.[0] ? (
                        <Image src={item.product.imageUrls[0]} alt={item.product.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        ${Number(item.unitPrice).toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold text-sm shrink-0">${Number(item.total).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t dark:border-gray-700 pt-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide">
                <Tag size={13} /> Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>${Number(order.subtotal).toFixed(2)}</span>
                </div>
                {order.discountAmount && Number(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount {order.discountCode ? `(${order.discountCode})` : ''}</span>
                    <span>−${Number(order.discountAmount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span>{Number(order.shippingCost) === 0 ? 'Free' : `$${Number(order.shippingCost).toFixed(2)}`}</span>
                </div>
                {Number(order.tax) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax</span>
                    <span>${Number(order.tax).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base border-t dark:border-gray-700 pt-2 mt-2">
                  <span>Total</span>
                  <span>${Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="border-t dark:border-gray-700 pt-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide">
                <CreditCard size={13} /> Payment
              </h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="font-medium">{isTestOrder ? 'Test Order' : 'Stripe'}</span>
                </div>
                {order.stripeSessionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Session</span>
                    <span className="font-mono text-xs text-gray-500">{order.stripeSessionId.slice(-16)}</span>
                  </div>
                )}
                {order.stripePaymentId && !isTestOrder && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment ID</span>
                    <span className="font-mono text-xs text-gray-500">{order.stripePaymentId.slice(-16)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            {order.address && (
              <div className="border-t dark:border-gray-700 pt-4">
                <h3 className="font-semibold mb-2 text-xs text-gray-500 uppercase tracking-wide">Shipping Address</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {order.address.street}, {order.address.city}, {order.address.state} {order.address.postalCode}, {order.address.country}
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    const qs = new URLSearchParams({ limit: '50' });
    if (filter) qs.set('status', filter);
    api.get(`/admin/orders?${qs}`)
      .then((r) => setOrders(r.data.orders))
      .finally(() => setLoading(false));
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
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
        </div>
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
                <tr
                  key={o.id}
                  className="hover:bg-amber-50/50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedOrderId(o.id)}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">#{o.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.user?.firstName} {o.user?.lastName}</p>
                    <p className="text-xs text-gray-400">{o.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-xs">
                    <span className="truncate block">{o.items?.map((i) => `${i.product.name} ×${i.quantity}`).join(', ')}</span>
                  </td>
                  <td className="px-4 py-3 font-bold">${Number(o.total).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-700'}`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
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

      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onStatusUpdate={fetchOrders}
        />
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
