'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HeroSection() {
  const t = useTranslations('home.hero');

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-amber-950 text-white overflow-hidden min-h-[560px] flex items-center">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-amber-700/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-3xl" />
      </div>

      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #d97706 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-36 w-full">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-amber-500/30">
            <Sparkles size={14} />
            {t('badge')}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">
            {t('subtitle')}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold px-8 py-4 rounded-xl transition-colors text-base"
            >
              {t('cta')} <ArrowRight size={18} />
            </Link>
            <Link
              href="/products?category=niche"
              className="inline-flex items-center gap-2 border border-white/20 hover:bg-white/10 text-white font-medium px-8 py-4 rounded-xl transition-colors text-base"
            >
              {t('ctaSecondary')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
