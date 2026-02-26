import { getTranslations } from 'next-intl/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';
import CategoryCards from '@/components/products/CategoryCards';

interface SearchParams {
  category?: string;
  search?: string;
  page?: string;
  sort?: string;
  featured?: string;
}

async function getProducts(params: SearchParams) {
  const query = new URLSearchParams();
  if (params.category) query.set('category', params.category);
  if (params.search) query.set('search', params.search);
  if (params.page) query.set('page', params.page);
  if (params.sort) query.set('sort', params.sort);
  if (params.featured) query.set('featured', params.featured);
  query.set('limit', '12');

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${query}`, { next: { revalidate: 30 } });
    if (!res.ok) return { products: [], pagination: null };
    return res.json();
  } catch {
    return { products: [], pagination: null };
  }
}

async function getCategories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.categories ?? data ?? [];
  } catch {
    return [];
  }
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const t = await getTranslations('products');
  const [{ products, pagination }, categories] = await Promise.all([
    getProducts(searchParams),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full">

        {/* Page heading */}
        <div className="mb-8" data-aos="fade-down">
          <h1 className="text-4xl font-semibold tracking-tight">{t('title')}</h1>
          {searchParams.search && (
            <p className="mt-1 text-sm text-gray-400">
              Results for &quot;{searchParams.search}&quot;
            </p>
          )}
        </div>

        {/* Category pills */}
        {categories.length > 0 && (
          <CategoryCards categories={categories} selectedCategory={searchParams.category} />
        )}

        {/* Layout: sidebar + grid */}
        <div className="flex flex-col md:flex-row gap-10">

          {/* Sidebar */}
          <aside className="w-full md:w-52 shrink-0">
            <ProductFilters />
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {products.map((p: Record<string, unknown>, i: number) => (
                    <div
                      key={p.id as string}
                      data-aos="fade-up"
                      data-aos-delay={String(i * 60)}
                    >
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>

                {pagination && pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-12" data-aos="fade-up">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                      <a
                        key={p}
                        href={`?page=${p}`}
                        className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                          p === pagination.page
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow'
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {p}
                      </a>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400" data-aos="fade-up">
                <span className="text-5xl mb-4 opacity-30">🌸</span>
                <p className="text-sm">{t('noResults')}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
