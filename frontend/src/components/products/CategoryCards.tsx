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

  const base =
    'px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap';
  const active =
    'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm';
  const inactive =
    'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700';

  return (
    <div className="overflow-x-auto -mx-1 px-1 mb-10" data-aos="fade-down">
      <div className="flex items-center gap-2 w-max">
        <Link href="/products" className={`${base} ${!selectedCategory ? active : inactive}`}>
          {locale === 'es' ? 'Todas' : 'All'}
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className={`${base} ${selectedCategory === cat.slug ? active : inactive}`}
          >
            {locale === 'es' ? cat.nameEs : cat.name}
            {cat._count && (
              <span className="ml-1.5 text-xs opacity-50">({cat._count.products})</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
