'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Package, CreditCard, Truck, Tag } from 'lucide-react';
import { api } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProtectedPage from '@/components/auth/ProtectedPage';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  total: number;
  product: { name: string; imageUrls: string[]; slug: string };
}

interface Order {
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
  items: OrderItem[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-orange-100 text-orange-700',
};

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const isTestOrder = order.stripeSessionId?.startsWith('test_');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div>
            <p className="font-bold text-lg">Order #{order.id.slice(-8).toUpperCase()}</p>
            <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`badge text-sm px-3 py-1 ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
              {order.status}
            </span>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Items */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm text-gray-500 uppercase tracking-wide">
              <Package size={15} /> Items
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
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="font-medium text-sm hover:text-amber-600 transition-colors"
                      onClick={onClose}
                    >
                      {item.product.name}
                    </Link>
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
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm text-gray-500 uppercase tracking-wide">
              <Tag size={15} /> Summary
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
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm text-gray-500 uppercase tracking-wide">
              <CreditCard size={15} /> Payment
            </h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium">{isTestOrder ? 'Test Order (no payment)' : 'Stripe'}</span>
              </div>
              {order.stripePaymentId && !isTestOrder && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment ID</span>
                  <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{order.stripePaymentId.slice(-12)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping info */}
          {order.status === 'SHIPPED' || order.status === 'DELIVERED' ? (
            <div className="border-t dark:border-gray-700 pt-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm text-gray-500 uppercase tracking-wide">
                <Truck size={15} /> Shipping
              </h3>
              <p className="text-sm text-gray-500">
                {order.status === 'DELIVERED' ? 'Your order has been delivered.' : 'Your order is on its way.'}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    api.get('/orders').then((r) => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">No orders yet</p>
            <Link href="/products" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="card p-6 w-full text-left hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold">Order #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`badge ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                      {order.status}
                    </span>
                    <span className="font-bold">${Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-1.5">
                      <span className="font-medium">{item.product.name}</span>
                      <span className="text-gray-400">×{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-amber-600 mt-3 font-medium">Click to view details →</p>
              </button>
            ))}
          </div>
        )}
      </main>
      <Footer />

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedPage>
      <OrdersContent />
    </ProtectedPage>
  );
}
