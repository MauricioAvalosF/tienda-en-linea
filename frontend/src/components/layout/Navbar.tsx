'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ShoppingCart, User, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';

export default function Navbar() {
  const t = useTranslations('nav');
  const { user, logout } = useAuthStore();
  const count = useCartStore((s) => s.count());
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-primary-600">
          Tienda
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary-600 transition-colors">{t('home')}</Link>
          <Link href="/products" className="text-sm font-medium hover:text-primary-600 transition-colors">{t('products')}</Link>
          {user?.role === 'ADMIN' && (
            <Link href="/admin" className="text-sm font-medium text-primary-600 hover:text-primary-700">{t('admin')}</Link>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Cart */}
          <Link href="/cart" className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ShoppingCart size={20} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>

          {/* User */}
          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <User size={20} />
                <span className="text-sm hidden sm:block">{user.firstName}</span>
              </button>
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-900 border rounded-xl shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
                <Link href="/account" className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">{t('account')}</Link>
                <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800">
                  {t('logout')}
                </button>
              </div>
            </div>
          ) : (
            <Link href="/auth/login" className="btn-primary text-sm">{t('login')}</Link>
          )}

          {/* Mobile hamburger */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t px-4 py-3 flex flex-col gap-3 bg-white dark:bg-gray-900">
          <Link href="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium">{t('home')}</Link>
          <Link href="/products" onClick={() => setMobileOpen(false)} className="text-sm font-medium">{t('products')}</Link>
          {user?.role === 'ADMIN' && (
            <Link href="/admin" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-primary-600">{t('admin')}</Link>
          )}
        </div>
      )}
    </nav>
  );
}
