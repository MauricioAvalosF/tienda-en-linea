'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Search } from 'lucide-react';

export default function ProductFilters() {
  const t = useTranslations('products');
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get('search') || '');

  const setParam = (key: string, value: string | null) => {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    p.delete('page');
    router.push(`/products?${p.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParam('search', search || null);
  };

  const featured = params.get('featured') === 'true';

  return (
    <div className="space-y-6" data-aos="fade-right">
      {/* Search */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
          {t('filter')}
        </p>
        <form onSubmit={handleSearch} className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search fragrances…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 placeholder-gray-400 transition"
          />
        </form>
      </div>

      {/* Sort */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
          {t('sort')}
        </p>
        <select
          value={params.get('sort') || 'createdAt'}
          onChange={(e) => setParam('sort', e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 transition appearance-none cursor-pointer"
        >
          <option value="createdAt">Newest First</option>
          <option value="price">Price: Low to High</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      {/* Featured toggle */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
          Collection
        </p>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => setParam('featured', featured ? null : 'true')}
            className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
              featured ? 'bg-gray-900 dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white dark:bg-gray-900 shadow transition-transform duration-200 ${
                featured ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
            Featured only
          </span>
        </label>
      </div>
    </div>
  );
}
