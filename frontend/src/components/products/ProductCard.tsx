'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { ShoppingCart } from 'lucide-react';
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

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    try {
      await addItem(p.id);
      toast.success(`${displayName} added to cart`);
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <Link href={`/products/${p.slug}`} className="card group overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
        {p.imageUrls?.[0] ? (
          <Image
            src={p.imageUrls[0]}
            alt={displayName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
        )}
        {p.comparePrice && p.comparePrice > p.price && (
          <span className="absolute top-2 left-2 badge bg-red-100 text-red-700">
            -{Math.round((1 - p.price / p.comparePrice) * 100)}%
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-semibold">{t('outOfStock')}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {p.category && (
          <p className="text-xs text-gray-500 mb-1">{locale === 'es' ? p.category.nameEs : p.category.name}</p>
        )}
        <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
          {displayName}
        </h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-bold text-lg">${Number(p.price).toFixed(2)}</span>
          {p.comparePrice && p.comparePrice > p.price && (
            <span className="text-sm text-gray-400 line-through">${Number(p.comparePrice).toFixed(2)}</span>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          disabled={!inStock || isLoading}
          className="w-full btn-primary flex items-center justify-center gap-2 text-sm py-2"
        >
          <ShoppingCart size={16} />
          {t('addToCart')}
        </button>
      </div>
    </Link>
  );
}
