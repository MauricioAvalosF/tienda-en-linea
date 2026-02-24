'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { Bell, ShoppingBag, X, CheckCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { clsx } from 'clsx';

const LS_KEY = 'admin_notifications_last_read';

const STATUS_STYLES: Record<string, string> = {
  PENDING:    'bg-yellow-100 text-yellow-700',
  PAID:       'bg-green-100 text-green-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED:    'bg-purple-100 text-purple-700',
  DELIVERED:  'bg-emerald-100 text-emerald-700',
  CANCELLED:  'bg-red-100 text-red-700',
  REFUNDED:   'bg-gray-100 text-gray-600',
};

interface Order {
  id: string;
  status: string;
  total: string;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const getLastRead = () => localStorage.getItem(LS_KEY) ?? new Date(0).toISOString();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const since = getLastRead();
      const { data } = await api.get(`/admin/notifications?since=${encodeURIComponent(since)}`);
      setOrders(data.orders);
      setUnread(data.unreadCount);
    } catch {
      // silently fail — don't disrupt admin UI
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + polling every 30s
  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  // Close on click outside
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const markAllRead = () => {
    localStorage.setItem(LS_KEY, new Date().toISOString());
    setUnread(0);
  };

  const handleOpen = () => {
    setOpen((v) => !v);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title="Notifications"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 leading-none">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unread > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                >
                  <CheckCheck size={13} /> Mark read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y dark:divide-gray-800">
            {loading && orders.length === 0 ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full" />
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-gray-400">
                <ShoppingBag size={28} />
                <p className="text-sm">No orders yet</p>
              </div>
            ) : (
              orders.map((order) => {
                const isNew = new Date(order.createdAt) > new Date(getLastRead());
                return (
                  <Link
                    key={order.id}
                    href="/admin/orders"
                    onClick={() => setOpen(false)}
                    className={clsx(
                      'flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
                      isNew && 'bg-amber-50/60 dark:bg-amber-900/10'
                    )}
                  >
                    {/* Icon */}
                    <div className={clsx(
                      'mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                      isNew ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-gray-100 dark:bg-gray-800'
                    )}>
                      <ShoppingBag size={14} className={isNew ? 'text-amber-600' : 'text-gray-500'} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate">
                          {order.user.firstName} {order.user.lastName}
                        </p>
                        <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{order.user.email}</p>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs font-semibold text-amber-600">${Number(order.total).toFixed(2)}</span>
                        <span className="text-[11px] text-gray-400">{timeAgo(order.createdAt)}</span>
                      </div>
                    </div>

                    {/* Unread dot */}
                    {isNew && (
                      <div className="mt-2 w-2 h-2 bg-amber-500 rounded-full shrink-0" />
                    )}
                  </Link>
                );
              })
            )}
          </div>

          {/* Footer */}
          {orders.length > 0 && (
            <div className="border-t dark:border-gray-700 px-4 py-2">
              <Link
                href="/admin/orders"
                onClick={() => setOpen(false)}
                className="text-xs text-amber-600 hover:text-amber-700 font-medium"
              >
                View all orders →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
