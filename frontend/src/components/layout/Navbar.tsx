'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ShoppingCart, User, Menu, X, Sun, Moon, ChevronDown } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const t = useTranslations('nav');
  const { user, logout } = useAuthStore();
  const count = useCartStore((s) => s.count());
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.jpg"
            alt="Maison de Parfum"
            width={80}
            height={80}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-amber-600 transition-colors">{t('home')}</Link>
          <Link href="/products" className="text-sm font-medium hover:text-amber-600 transition-colors">{t('products')}</Link>
          <Link href="/products?category=niche" className="text-sm font-medium hover:text-amber-600 transition-colors">Niche</Link>
          <Link href="/products?category=designer" className="text-sm font-medium hover:text-amber-600 transition-colors">Designer</Link>
          <Link href="/products?category=arabic" className="text-sm font-medium hover:text-amber-600 transition-colors">Arabic</Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />

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
              <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>

          {/* User menu — click-based, no gap flicker */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <User size={18} />
                <span className="text-sm hidden sm:block font-medium">{user.firstName}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-xl shadow-lg py-1 z-50">
                  {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm font-medium text-amber-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      {t('admin')}
                    </Link>
                  )}
                  <Link
                    href="/account/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    My Orders
                  </Link>
                  <div className="border-t dark:border-gray-700 my-1" />
                  <button
                    onClick={() => { logout(); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {t('logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login" className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              {t('login')}
            </Link>
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
          <Link href="/products?category=niche" onClick={() => setMobileOpen(false)} className="text-sm font-medium">Niche</Link>
          <Link href="/products?category=designer" onClick={() => setMobileOpen(false)} className="text-sm font-medium">Designer</Link>
          <Link href="/products?category=arabic" onClick={() => setMobileOpen(false)} className="text-sm font-medium">Arabic</Link>
          {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
            <Link href="/admin" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-amber-600">{t('admin')}</Link>
          )}
          {user && (
            <Link href="/account/profile" onClick={() => setMobileOpen(false)} className="text-sm font-medium">My Profile</Link>
          )}
        </div>
      )}
    </nav>
  );
}
