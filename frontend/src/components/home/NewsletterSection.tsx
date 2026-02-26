'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';

export default function NewsletterSection() {
  const t = useTranslations('home.newsletter');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success('Thanks for subscribing!');
      setEmail('');
    }
  };

  return (
    <section className="py-24 bg-gray-950 text-white relative overflow-hidden">
      {/* subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(ellipse 60% 60% at 50% 110%,rgba(217,119,6,0.15),transparent)' }}
      />
      <div className="relative max-w-xl mx-auto px-4 text-center" data-aos="fade-up">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-4">Newsletter</p>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">{t('title')}</h2>
        <p className="text-gray-400 mb-8 text-sm leading-relaxed">{t('subtitle')}</p>
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('placeholder')}
            required
            className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-white/30 transition"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 bg-white text-gray-900 font-semibold px-5 py-3 rounded-full hover:bg-gray-100 active:scale-95 transition-all text-sm whitespace-nowrap"
          >
            {t('button')} <ArrowRight size={14} />
          </button>
        </form>
      </div>
    </section>
  );
}
