'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

interface Category {
  id: string;
  slug: string;
  name: string;
  nameEs: string;
  imageUrl?: string;
  _count?: { products: number };
}

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  const t = useTranslations('home');
  const locale = useLocale();

  if (!categories.length) return null;

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">{t('categories')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="card p-6 text-center hover:shadow-md transition-shadow group"
            >
              {cat.imageUrl && (
                <img src={cat.imageUrl} alt={cat.name} className="w-16 h-16 object-cover rounded-full mx-auto mb-3" />
              )}
              <h3 className="font-semibold group-hover:text-primary-600 transition-colors">
                {locale === 'es' ? cat.nameEs : cat.name}
              </h3>
              {cat._count && (
                <p className="text-sm text-gray-500 mt-1">{cat._count.products} products</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
