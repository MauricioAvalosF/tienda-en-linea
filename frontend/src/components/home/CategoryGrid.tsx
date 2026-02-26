'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight } from 'lucide-react';

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
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12" data-aos="fade-up">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3">Collections</p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{t('categories')}</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl aspect-square bg-gray-100 dark:bg-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              data-aos="fade-up"
              data-aos-delay={String(i * 80)}
            >
              {cat.imageUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.imageUrl}
                    alt={locale === 'es' ? cat.nameEs : cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-stone-200 dark:from-amber-900/40 dark:to-stone-800" />
              )}

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className={`font-semibold text-base leading-tight ${cat.imageUrl ? 'text-white' : 'text-gray-800 dark:text-white'}`}>
                  {locale === 'es' ? cat.nameEs : cat.name}
                </h3>
                {cat._count && (
                  <p className={`text-xs mt-0.5 flex items-center gap-1 ${cat.imageUrl ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                    {cat._count.products} products
                    <ArrowRight size={10} className="transition-transform group-hover:translate-x-1" />
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
