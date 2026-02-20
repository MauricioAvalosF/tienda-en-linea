'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  const t = useTranslations('home.hero');

  return (
    <section className="relative bg-gradient-to-br from-primary-600 to-primary-900 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-36 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          {t('title')}
        </h1>
        <p className="text-xl md:text-2xl text-primary-100 mb-10 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-8 py-4 rounded-xl hover:bg-primary-50 transition-colors text-lg"
        >
          {t('cta')} <ArrowRight size={20} />
        </Link>
      </div>
    </section>
  );
}
