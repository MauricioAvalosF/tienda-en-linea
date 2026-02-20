'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedPage({ children, requireAdmin = false }: Props) {
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  // Wait for client-side hydration before checking auth
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (requireAdmin && user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [mounted, user, router, requireAdmin]);

  // Show spinner while hydrating or redirecting
  if (!mounted || !user || (requireAdmin && user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}
