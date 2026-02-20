'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Category {
  id: string;
  slug: string;
  name: string;
  nameEs: string;
}

export default function ProductFilters() {
  const t = useTranslations('products');
  const router = useRouter();
  const params = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState(params.get('search') || '');

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data)).catch(() => {});
  }, []);

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

  return (
    <div className="card p-4 space-y-6">
      {/* Search */}
      <div>
        <h3 className="font-semibold mb-2">{t('filter')}</h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('filter')}
            className="input text-sm"
          />
          <button type="submit" className="btn-primary text-sm px-3">Go</button>
        </form>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-2">Category</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setParam('category', null)}
              className={`text-sm w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${!params.get('category') ? 'text-primary-600 font-medium' : ''}`}
            >
              All
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => setParam('category', cat.slug)}
                className={`text-sm w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${params.get('category') === cat.slug ? 'text-primary-600 font-medium' : ''}`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Sort */}
      <div>
        <h3 className="font-semibold mb-2">{t('sort')}</h3>
        <select
          value={params.get('sort') || 'createdAt'}
          onChange={(e) => setParam('sort', e.target.value)}
          className="input text-sm"
        >
          <option value="createdAt">Newest</option>
          <option value="price">Price: Low to High</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>
    </div>
  );
}
