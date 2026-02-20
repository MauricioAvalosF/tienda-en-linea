'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';

export default function CheckoutSuccessPage() {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <CheckCircle size={80} className="text-green-500 mb-6" />
      <h1 className="text-3xl font-bold mb-3">Order Confirmed!</h1>
      <p className="text-gray-500 mb-8 max-w-md">
        Thank you for your purchase. You will receive a confirmation email shortly.
      </p>
      <div className="flex gap-4">
        <Link href="/account/orders" className="btn-primary">View My Orders</Link>
        <Link href="/products" className="btn-secondary">Continue Shopping</Link>
      </div>
    </div>
  );
}
