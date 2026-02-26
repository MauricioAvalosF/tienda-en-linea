'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  slug: string;
  name: string;
  nameEs: string;
  price: number;
  comparePrice?: number;
  stock: number;
  imageUrls: string[];
  isFeatured: boolean;
  category?: { name: string; nameEs: string };
}

export default function ProductCard({ product }: { product: Record<string, unknown> }) {
  const p = product as unknown as Product;
  const locale = useLocale();
  const t = useTranslations('products');
  const { addItem, isLoading } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const displayName = locale === 'es' ? p.nameEs : p.name;
  const inStock = p.stock > 0;
  const discount =
    p.comparePrice && p.comparePrice > p.price
      ? Math.round((1 - p.price / p.comparePrice) * 100)
      : null;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    try {
      await addItem(p.id);
      toast.success(`${displayName} added`);
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <Link href={`/products/${p.slug}`} className="group block">
      <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">

        {/* Image */}
        <div className="relative aspect-square bg-gray-50 dark:bg-gray-800 overflow-hidden">
          {p.imageUrls?.[0] ? (
            <Image
              src={p.imageUrls[0]}
              alt={displayName}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl opacity-20">🌸</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {discount && (
              <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                -{discount}%
              </span>
            )}
            {p.isFeatured && !discount && (
              <span className="bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                Featured
              </span>
            )}
          </div>

          {/* Out of stock overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-300">
                {t('outOfStock')}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          {p.category && (
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
              {locale === 'es' ? p.category.nameEs : p.category.name}
            </p>
          )}
          <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-3 leading-snug">
            {displayName}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-semibold">${Number(p.price).toFixed(2)}</span>
              {p.comparePrice && p.comparePrice > p.price && (
                <span className="text-xs text-gray-400 line-through">${Number(p.comparePrice).toFixed(2)}</span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!inStock || isLoading}
              className="flex items-center gap-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium px-3 py-1.5 rounded-full hover:opacity-75 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ShoppingBag size={12} />
              {inStock ? 'Add' : '—'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
