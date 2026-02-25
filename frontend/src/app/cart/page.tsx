'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Trash2, Minus, Plus, ShoppingBag, Tag, X, FlaskConical, MapPin, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface AppliedDiscount {
  id: string;
  name: string;
  code: string | null;
  type: string;
  value: number;
  savingsAmount: number;
}

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export default function CartPage() {
  const t = useTranslations('cart');
  const { items, removeItem, updateItem, total } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  useEffect(() => {
    if (user) {
      api.get('/users/profile').then((r) => {
        const addrs: Address[] = r.data.addresses ?? [];
        setAddresses(addrs);
        const def = addrs.find((a) => a.isDefault) ?? addrs[0];
        if (def) setSelectedAddressId(def.id);
      }).catch(() => {});
    }
  }, [user]);

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    if (!user) { toast.error('Please log in to apply a coupon'); return; }
    setCouponLoading(true);
    try {
      const { data } = await api.post('/discounts/validate', {
        code: couponInput.trim().toUpperCase(),
        cartTotal: total(),
      });
      setAppliedDiscount({ ...data.discount, savingsAmount: data.savingsAmount });
      toast.success(`Coupon applied! You save $${data.savingsAmount.toFixed(2)}`);
      setCouponInput('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => { setAppliedDiscount(null); toast.success('Coupon removed'); };

  const handleCheckout = async () => {
    if (!user) { router.push('/auth/login'); return; }
    try {
      const { data } = await api.post('/stripe/checkout', {
        couponCode: appliedDiscount?.code ?? null,
        addressId: selectedAddressId || null,
      });
      window.location.href = data.url;
    } catch {
      toast.error('Checkout failed');
    }
  };

  const handleTestCheckout = async () => {
    if (!user) { router.push('/auth/login'); return; }
    setTestLoading(true);
    try {
      await api.post('/stripe/test-checkout', { addressId: selectedAddressId || null });
      router.push('/checkout/success');
    } catch {
      toast.error('Test checkout failed');
    } finally {
      setTestLoading(false);
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
  const shipping = subtotal > 50 || appliedDiscount?.type === 'FREE_SHIPPING' ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const discountSavings = appliedDiscount?.type === 'FREE_SHIPPING' ? 0 : (appliedDiscount?.savingsAmount ?? 0);
  const orderTotal = Math.max(0, subtotal + shipping + tax - discountSavings);

  const selectedAddr = addresses.find((a) => a.id === selectedAddressId);

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
                    <button onClick={() => removeItem(item.productId)} className="ml-auto text-red-500 hover:text-red-700 p-1">
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

              {/* Coupon */}
              <div>
                {appliedDiscount ? (
                  <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <Tag size={14} />
                      <span className="text-sm font-medium">{appliedDiscount.code ?? appliedDiscount.name}</span>
                      {appliedDiscount.type !== 'FREE_SHIPPING' && <span className="text-xs">−${appliedDiscount.savingsAmount.toFixed(2)}</span>}
                      {appliedDiscount.type === 'FREE_SHIPPING' && <span className="text-xs">Free shipping</span>}
                    </div>
                    <button onClick={removeCoupon} className="text-green-600 hover:text-green-800"><X size={14} /></button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                      placeholder="Coupon code"
                      className="input flex-1 text-sm py-2"
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="btn-secondary px-3 py-2 text-sm font-medium disabled:opacity-50"
                    >
                      {couponLoading ? '…' : 'Apply'}
                    </button>
                  </div>
                )}
              </div>

              {/* Shipping address */}
              {user && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <MapPin size={12} /> Shipping Address
                  </p>
                  {addresses.length > 0 ? (
                    <div className="relative">
                      <select
                        value={selectedAddressId}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                        className="input text-sm py-2 pr-8 appearance-none w-full"
                      >
                        {addresses.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.label} — {a.street}, {a.city}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                    </div>
                  ) : (
                    <Link
                      href="/account/profile"
                      className="flex items-center gap-1.5 text-sm text-amber-600 hover:underline"
                    >
                      <Plus size={13} /> Add a shipping address
                    </Link>
                  )}
                  {selectedAddr && (
                    <p className="text-xs text-gray-400 mt-1">
                      {selectedAddr.city}{selectedAddr.state ? `, ${selectedAddr.state}` : ''} {selectedAddr.postalCode}, {selectedAddr.country}
                    </p>
                  )}
                </div>
              )}

              {/* Pricing */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('subtotal')}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discountSavings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>−${discountSavings.toFixed(2)}</span>
                  </div>
                )}
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

              {shipping > 0 && !appliedDiscount && (
                <p className="text-xs text-gray-500">Free shipping on orders over $50</p>
              )}

              <button onClick={handleCheckout} className="btn-primary w-full py-3 text-base">
                {t('checkout')}
              </button>

              {/* Test checkout */}
              <div className="border-t pt-3">
                <p className="text-[11px] text-gray-400 text-center mb-2 flex items-center justify-center gap-1">
                  <FlaskConical size={11} /> Test mode — no payment required
                </p>
                <button
                  onClick={handleTestCheckout}
                  disabled={testLoading}
                  className="w-full py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-amber-400 hover:text-amber-600 dark:hover:border-amber-500 dark:hover:text-amber-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FlaskConical size={15} />
                  {testLoading ? 'Processing…' : 'Place Test Order'}
                </button>
              </div>

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
