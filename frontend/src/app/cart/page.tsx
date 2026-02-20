'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function CartPage() {
  const t = useTranslations('cart');
  const { items, removeItem, updateItem, total } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const handleCheckout = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    try {
      const { data } = await api.post('/stripe/checkout');
      window.location.href = data.url;
    } catch {
      toast.error('Checkout failed');
    }
  };

  if (!items.length) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
          <ShoppingBag size={64} className="text-gray-300" />
          <h1 className="text-2xl font-bold text-gray-600">{t('empty')}</h1>
          <Link href="/products" className="btn-primary">{t('continueShopping')}</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const subtotal = total();
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const orderTotal = subtotal + shipping + tax;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
        <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Items */}
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="card p-4 flex gap-4">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {item.product.imageUrls?.[0] ? (
                    <Image src={item.product.imageUrls[0]} alt={item.product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </div>
                <div className="flex-1">
                  <Link href={`/products/${item.product.slug}`} className="font-semibold hover:text-primary-600">
                    {item.product.name}
                  </Link>
                  <p className="text-primary-600 font-bold mt-1">${Number(item.product.price).toFixed(2)}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => item.quantity > 1 ? updateItem(item.productId, item.quantity - 1) : removeItem(item.productId)}
                      className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateItem(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="ml-auto text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="font-bold text-right">
                  ${(Number(item.product.price) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:w-80">
            <div className="card p-6 space-y-4 sticky top-20">
              <h2 className="font-bold text-lg">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('subtotal')}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('shipping')}</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('tax')}</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-base">
                  <span>{t('total')}</span>
                  <span>${orderTotal.toFixed(2)}</span>
                </div>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-500">Free shipping on orders over $50</p>
              )}
              <button onClick={handleCheckout} className="btn-primary w-full py-3 text-base">
                {t('checkout')}
              </button>
              <Link href="/products" className="btn-secondary w-full py-2 text-center block text-sm">
                {t('continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
