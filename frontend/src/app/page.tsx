import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import HeroSection from '@/components/home/HeroSection';
import CategoryGrid from '@/components/home/CategoryGrid';
import NewsletterSection from '@/components/home/NewsletterSection';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function getCmsData() {
  try {
    const res = await fetch(`${API}/cms`, { cache: 'no-store' });
    if (!res.ok) return { sections: [], settings: [] };
    return res.json();
  } catch {
    return { sections: [], settings: [] };
  }
}

async function getFeaturedProducts() {
  try {
    const res = await fetch(`${API}/products?featured=true&limit=8`, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const res = await fetch(`${API}/categories`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const t = await getTranslations('home');
  const [cms, products, categories] = await Promise.all([getCmsData(), getFeaturedProducts(), getCategories()]);

  const heroSection = cms.sections?.find((s: { key: string }) => s.key === 'hero');
  const announcementSection = cms.sections?.find((s: { key: string; isActive: boolean }) => s.key === 'announcement' && s.isActive);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Announcement bar */}
      {announcementSection && (
        <div className="bg-amber-600 text-white text-sm text-center py-2 px-4 flex items-center justify-center gap-3">
          <span>{announcementSection.heading}</span>
          {announcementSection.ctaUrl && (
            <Link href={announcementSection.ctaUrl} className="underline font-medium hover:no-underline">
              {announcementSection.ctaText}
            </Link>
          )}
        </div>
      )}

      <Navbar />
      <main className="flex-1">
        <HeroSection cms={heroSection} />

        {/* Featured Products */}
        <section className="py-20 px-4 max-w-7xl mx-auto">
          <div className="text-center mb-12" data-aos="fade-up">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3">Selection</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{t('featured')}</h2>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {products.map((product: Record<string, unknown>, i: number) => (
                <div key={product.id as string} data-aos="fade-up" data-aos-delay={String(i * 60)}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 text-sm">No featured products yet.</p>
          )}

          <div className="text-center mt-12" data-aos="fade-up">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold px-8 py-3.5 rounded-full hover:opacity-80 active:scale-95 transition-all text-sm"
            >
              View All Fragrances
            </Link>
          </div>
        </section>

        <CategoryGrid categories={categories} />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
}
