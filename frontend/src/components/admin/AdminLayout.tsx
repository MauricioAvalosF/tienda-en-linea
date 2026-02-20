'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, Home } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { href: '/admin', label: 'dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'products', icon: Package },
  { href: '/admin/orders', label: 'orders', icon: ShoppingCart },
  { href: '/admin/users', label: 'users', icon: Users },
  { href: '/admin/categories', label: 'categories', icon: Tag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('admin');
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r shrink-0 flex flex-col">
        <div className="p-6 border-b">
          <Link href="/" className="text-lg font-bold text-primary-600">Tienda Admin</Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                )}
              >
                <item.icon size={18} />
                {t(item.label as 'dashboard' | 'products' | 'orders' | 'users' | 'categories')}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
            <Home size={16} /> Back to Store
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
