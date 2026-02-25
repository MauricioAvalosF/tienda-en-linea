import { getTranslations } from 'next-intl/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ContactForm from '@/components/contact/ContactForm';
import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function getCmsSettings() {
  try {
    const res = await fetch(`${API}/cms`, { cache: 'no-store' });
    if (!res.ok) return {};
    const data = await res.json();
    const settings: Record<string, string> = {};
    for (const s of data.settings ?? []) {
      settings[s.key] = s.value;
    }
    return settings;
  } catch {
    return {};
  }
}

export default async function ContactoPage() {
  const t = await getTranslations('contact');
  const settings = await getCmsSettings();

  const address = settings['contact_address'] || t('info.address');
  const phone = settings['contact_phone'] || t('info.phone');
  const email = settings['contact_email'] || t('info.email');
  const instagram = settings['social_instagram'];
  const facebook = settings['social_facebook'];
  const whatsapp = settings['social_whatsapp'];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* Header */}
        <section className="bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 py-16 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">{t('heading')}</h1>
          <p className="text-amber-200 max-w-lg mx-auto">{t('subheading')}</p>
        </section>

        {/* Content */}
        <section className="max-w-7xl mx-auto px-4 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

            {/* Form — wider column */}
            <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
              <ContactForm />
            </div>

            {/* Info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-xl font-bold mb-5 text-amber-700 dark:text-amber-400">{t('info.title')}</h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <MapPin size={20} className="mt-0.5 text-amber-600 shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">{address}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone size={20} className="text-amber-600 shrink-0" />
                    <a href={`tel:${phone}`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600 transition-colors">
                      {phone}
                    </a>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail size={20} className="text-amber-600 shrink-0" />
                    <a href={`mailto:${email}`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-amber-600 transition-colors">
                      {email}
                    </a>
                  </li>
                </ul>
              </div>

              {(instagram || facebook || whatsapp) && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-4">{t('info.followUs')}</h3>
                  <div className="flex gap-3">
                    {instagram && (
                      <a
                        href={instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-600 transition-colors"
                      >
                        <Instagram size={20} />
                      </a>
                    )}
                    {facebook && (
                      <a
                        href={facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-600 transition-colors"
                      >
                        <Facebook size={20} />
                      </a>
                    )}
                    {whatsapp && (
                      <a
                        href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-600 transition-colors"
                      >
                        <Phone size={20} />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Decorative card */}
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
                <p className="text-3xl mb-2">🌸</p>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">Maison de Parfum</p>
                <p className="text-xs text-amber-700/70 dark:text-amber-400/70 leading-relaxed">
                  {`We reply within 24 hours — Monday to Saturday.`}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
