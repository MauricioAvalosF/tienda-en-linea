import { getTranslations } from 'next-intl/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';

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

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const t = await getTranslations('products');
  const { products, pagination } = await getProducts(searchParams);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">
        <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 shrink-0">
            <ProductFilters />
          </aside>
          <div className="flex-1">
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((p: Record<string, unknown>) => (
                    <ProductCard key={p.id as string} product={p} />
                  ))}
                </div>
                {pagination && pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                      <a
                        key={p}
                        href={`?page=${p}`}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                          p === pagination.page
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {p}
                      </a>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 text-gray-500">{t('noResults')}</div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
