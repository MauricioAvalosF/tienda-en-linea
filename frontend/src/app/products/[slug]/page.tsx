'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, ArrowLeft, Star, Package } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { firstName: string; lastName: string };
}

interface Product {
  id: string;
  slug: string;
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  price: number;
  comparePrice?: number;
  stock: number;
  imageUrls: string[];
  sku?: string;
  isFeatured: boolean;
  category: { name: string; nameEs: string; slug: string };
  reviews: Review[];
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const locale = useLocale();
  const t = useTranslations('product');
  const router = useRouter();
  const { addItem, isLoading } = useCartStore();
  const { user } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    api.get(`/products/${slug}`)
      .then((r) => setProduct(r.data))
      .catch(() => router.push('/products'))
      .finally(() => setLoading(false));
  }, [slug, router]);

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (!product) return;
    const displayName = locale === 'es' ? product.nameEs : product.name;
    try {
      await addItem(product.id);
      toast.success(`${displayName} ${t('addedToCart')}`);
    } catch {
      toast.error(t('addToCartError'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) return null;

  const displayName = locale === 'es' ? product.nameEs : product.name;
  const displayDescription = locale === 'es' ? product.descriptionEs : product.description;
  const categoryName = locale === 'es' ? product.category.nameEs : product.category.name;
  const inStock = product.stock > 0;
  const avgRating = product.reviews.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 flex-wrap">
          <Link href="/products" className="hover:text-gray-700 flex items-center gap-1">
            <ArrowLeft size={14} /> {t('allProducts')}
          </Link>
          <span>/</span>
          <Link href={`/products?category=${product.category.slug}`} className="hover:text-gray-700">
            {categoryName}
          </Link>
          <span>/</span>
          <span className="text-gray-700 truncate max-w-xs">{displayName}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Image gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
              {product.imageUrls[selectedImage] ? (
                <Image
                  src={product.imageUrls[selectedImage]}
                  alt={displayName}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">{t('noImage')}</div>
              )}
              {product.comparePrice && Number(product.comparePrice) > Number(product.price) && (
                <span className="absolute top-4 left-4 bg-red-100 text-red-700 text-sm font-semibold px-3 py-1 rounded-full">
                  -{Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100)}% OFF
                </span>
              )}
            </div>
            {product.imageUrls.length > 1 && (
              <div className="flex gap-3">
                {product.imageUrls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                      i === selectedImage ? 'border-amber-500' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <Image src={url} alt={`${displayName} ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="space-y-6">
            <div>
              <Link
                href={`/products?category=${product.category.slug}`}
                className="text-sm text-amber-600 font-medium hover:underline"
              >
                {categoryName}
              </Link>
              <h1 className="text-3xl font-bold mt-1">{displayName}</h1>
              {product.sku && <p className="text-xs text-gray-400 mt-1">{t('sku')}: {product.sku}</p>}
            </div>

            {/* Rating summary */}
            {product.reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={16}
                      className={s <= Math.round(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {avgRating.toFixed(1)} ({product.reviews.length} {product.reviews.length === 1 ? t('review') : t('reviews')})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold">${Number(product.price).toFixed(2)}</span>
              {product.comparePrice && Number(product.comparePrice) > Number(product.price) && (
                <span className="text-xl text-gray-400 line-through mb-1">${Number(product.comparePrice).toFixed(2)}</span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{displayDescription}</p>

            {/* Stock status */}
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={inStock ? 'text-green-700 dark:text-green-400' : 'text-red-600'}>
                {inStock
                  ? `${t('inStock')} (${product.stock} ${t('available')})`
                  : t('outOfStock')}
              </span>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={!inStock || isLoading}
              className="w-full btn-primary flex items-center justify-center gap-3 py-4 text-base disabled:opacity-50"
            >
              <ShoppingCart size={20} />
              {isLoading ? t('adding') : t('addToCart')}
            </button>

            {Number(product.price) >= 50 && (
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Package size={14} /> {t('freeShipping')}
              </p>
            )}
          </div>
        </div>

        {/* Reviews */}
        {product.reviews.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">{t('customerReviews')}</h2>
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <div key={review.id} className="card p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="font-medium text-sm">
                      {review.user.firstName} {review.user.lastName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
