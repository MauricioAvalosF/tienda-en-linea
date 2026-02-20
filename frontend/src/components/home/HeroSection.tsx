'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CmsSection {
  heading?: string; headingEs?: string;
  subheading?: string; subheadingEs?: string;
  badge?: string; badgeEs?: string;
  imageUrl?: string;
  ctaText?: string; ctaTextEs?: string; ctaUrl?: string;
  ctaText2?: string; ctaText2Es?: string; ctaUrl2?: string;
}

interface Props {
  cms?: CmsSection;
}

export default function HeroSection({ cms }: Props) {
  const locale = useLocale();
  const isEs = locale === 'es';

  const heading = isEs ? (cms?.headingEs || cms?.heading) : cms?.heading || 'Discover Your Signature Scent';
  const subheading = isEs ? (cms?.subheadingEs || cms?.subheading) : cms?.subheading || 'Explore an exclusive collection of niche, designer, and Arabic fragrances.';
  const badge = isEs ? (cms?.badgeEs || cms?.badge) : cms?.badge || 'Premium Fragrances';
  const cta = isEs ? (cms?.ctaTextEs || cms?.ctaText) : cms?.ctaText || 'Shop Now';
  const cta2 = isEs ? (cms?.ctaText2Es || cms?.ctaText2) : cms?.ctaText2;
  const ctaUrl = cms?.ctaUrl || '/products';
  const ctaUrl2 = cms?.ctaUrl2 || '/products?category=niche';
  const bgImage = cms?.imageUrl;

  return (
    <section
      className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-amber-950 text-white overflow-hidden min-h-[560px] flex items-center"
      style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      {/* Overlay when background image */}
      {bgImage && <div className="absolute inset-0 bg-black/50" />}

      {/* Decorative blobs (no bg image) */}
      {!bgImage && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-amber-700/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #d97706 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-36 w-full">
        <div className="max-w-2xl">
          {badge && (
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-amber-500/30">
              <Sparkles size={14} />
              {badge}
            </div>
          )}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">{heading}</h1>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">{subheading}</p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={ctaUrl}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold px-8 py-4 rounded-xl transition-colors text-base"
            >
              {cta} <ArrowRight size={18} />
            </Link>
            {cta2 && (
              <Link
                href={ctaUrl2}
                className="inline-flex items-center gap-2 border border-white/20 hover:bg-white/10 text-white font-medium px-8 py-4 rounded-xl transition-colors text-base"
              >
                {cta2}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
