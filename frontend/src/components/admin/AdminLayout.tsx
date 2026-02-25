'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, Layers, Users2, Percent, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/store/auth.store';
const NotificationBell = dynamic(() => import('./NotificationBell'), { ssr: false });

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/groups', label: 'Member Groups', icon: Users2 },
  { href: '/admin/discounts', label: 'Discounts', icon: Percent },
  { href: '/admin/cms', label: 'CMS Editor', icon: Layers },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const currentNav = navItems.find((item) =>
    item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
  );

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const PageIcon = currentNav?.icon;

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="w-60 bg-white dark:bg-gray-900 border-r shrink-0 flex flex-col">
        <div className="p-4 border-b flex items-center justify-center">
          <Link href="/admin">
            <Image
              src="/logo.jpg"
              alt="Maison de Parfum"
              width={80}
              height={80}
              className="h-14 w-auto object-contain"
            />
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                )}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors w-full"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Right side: header + content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-14 bg-white dark:bg-gray-900 border-b flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2.5">
            {PageIcon && <PageIcon size={18} className="text-amber-600 dark:text-amber-400" />}
            <h1 className="text-base font-bold text-gray-800 dark:text-gray-200 tracking-tight">
              {currentNav?.label ?? 'Admin Panel'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 leading-none">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs mt-0.5 font-medium text-amber-600 dark:text-amber-400">
                    {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold text-sm shrink-0">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
              </div>
            )}
            <NotificationBell />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
