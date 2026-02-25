'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

interface Category {
  id: string;
  name: string;
  nameEs: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  _count?: { products: number };
}

interface Props {
  categories: Category[];
  selectedCategory?: string;
}

export default function CategoryCards({ categories, selectedCategory }: Props) {
  const locale = useLocale();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {/* "All" card */}
      <Link
        href="/products"
        className={`relative overflow-hidden rounded-xl flex flex-col items-center justify-center text-center h-28 transition-all border-2 ${
          !selectedCategory
            ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
            : 'border-transparent bg-gray-100 dark:bg-gray-800 hover:border-amber-300'
        }`}
      >
        <span className="text-2xl mb-1">✨</span>
        <span className="text-sm font-semibold">
          {locale === 'es' ? 'Todas' : 'All'}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {locale === 'es' ? 'Ver todo' : 'View all'}
        </span>
      </Link>

      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/products?category=${cat.slug}`}
          className={`relative overflow-hidden rounded-xl h-28 transition-all border-2 ${
            selectedCategory === cat.slug
              ? 'border-amber-500'
              : 'border-transparent hover:border-amber-300'
          }`}
        >
          {cat.imageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.imageUrl}
                alt={locale === 'es' ? cat.nameEs : cat.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30" />
          )}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className={`text-sm font-bold drop-shadow ${cat.imageUrl ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
              {locale === 'es' ? cat.nameEs : cat.name}
            </p>
            {cat._count && (
              <p className={`text-xs ${cat.imageUrl ? 'text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}>
                {cat._count.products} {locale === 'es' ? 'fragancias' : 'fragrances'}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
