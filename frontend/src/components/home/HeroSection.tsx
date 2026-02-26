'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowRight } from 'lucide-react';

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

  const heading = isEs ? (cms?.headingEs || cms?.heading) : cms?.heading || 'Discover Your\nSignature Scent';
  const subheading = isEs ? (cms?.subheadingEs || cms?.subheading) : cms?.subheading || 'Explore an exclusive collection of niche, designer, and Arabic fragrances from the world\'s finest houses.';
  const badge = isEs ? (cms?.badgeEs || cms?.badge) : cms?.badge || 'New Collection 2025';
  const cta = isEs ? (cms?.ctaTextEs || cms?.ctaText) : cms?.ctaText || 'Shop Now';
  const cta2 = isEs ? (cms?.ctaText2Es || cms?.ctaText2) : cms?.ctaText2;
  const ctaUrl = cms?.ctaUrl || '/products';
  const ctaUrl2 = cms?.ctaUrl2 || '/products?category=niche';
  const bgImage = cms?.imageUrl;

  return (
    <section
      className="relative overflow-hidden min-h-[600px] flex items-center"
      style={
        bgImage
          ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : {}
      }
    >
      {/* Background */}
      {!bgImage && (
        <div className="absolute inset-0 bg-gray-950">
          <div className="absolute inset-0 opacity-30"
            style={{ backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%,rgba(217,119,6,0.3),transparent)' }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        </div>
      )}
      {bgImage && <div className="absolute inset-0 bg-black/55" />}

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-28 md:py-40 w-full">
        <div className="max-w-2xl">
          {badge && (
            <div
              className="inline-flex items-center gap-2 text-amber-400/90 text-xs font-semibold tracking-widest uppercase mb-6"
              data-aos="fade-down"
              data-aos-delay="0"
            >
              <span className="w-4 h-px bg-amber-400/60" />
              {badge}
              <span className="w-4 h-px bg-amber-400/60" />
            </div>
          )}

          <h1
            className="text-5xl md:text-7xl font-semibold text-white mb-6 leading-[1.05] tracking-tight whitespace-pre-line"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            {heading}
          </h1>

          <p
            className="text-lg text-gray-300/80 mb-10 leading-relaxed max-w-lg"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            {subheading}
          </p>

          <div
            className="flex flex-wrap gap-3"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <Link
              href={ctaUrl}
              className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-7 py-3.5 rounded-full hover:bg-gray-100 active:scale-95 transition-all text-sm"
            >
              {cta} <ArrowRight size={16} />
            </Link>
            {cta2 && (
              <Link
                href={ctaUrl2}
                className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white/80 hover:text-white font-medium px-7 py-3.5 rounded-full transition-all text-sm"
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
