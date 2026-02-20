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
    const res = await fetch(`${API}/cms`, { next: { revalidate: 60 } });
    if (!res.ok) return { sections: [], settings: [] };
    return res.json();
  } catch {
    return { sections: [], settings: [] };
  }
}

async function getFeaturedProducts() {
  try {
    const res = await fetch(`${API}/products?featured=true&limit=8`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const res = await fetch(`${API}/categories`, { next: { revalidate: 300 } });
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
        <section className="py-16 px-4 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">{t('featured')}</h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product: Record<string, unknown>) => (
                <ProductCard key={product.id as string} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No featured products yet.</p>
          )}
          <div className="text-center mt-10">
            <Link href="/products" className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
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
