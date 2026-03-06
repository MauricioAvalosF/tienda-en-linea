import { getTranslations, getLocale } from 'next-intl/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function getCmsSections() {
  try {
    const res = await fetch(`${API}/cms`, { cache: 'no-store' });
    if (!res.ok) return { sections: [], settings: [] };
    return res.json();
  } catch {
    return { sections: [], settings: [] };
  }
}

interface CmsSection {
  key: string;
  heading?: string;
  headingEs?: string;
  subheading?: string;
  subheadingEs?: string;
  body?: string;
  bodyEs?: string;
  imageUrl?: string;
}

export default async function NosotrosPage() {
  const t = await getTranslations('about');
  const locale = await getLocale();
  const cms = await getCmsSections();
  const sections: CmsSection[] = cms.sections ?? [];

  const heroSection = sections.find((s) => s.key === 'about_hero');
  const storySection = sections.find((s) => s.key === 'about_story');
  const valuesSection = sections.find((s) => s.key === 'about_values');

  const pick = (section: CmsSection | undefined, enKey: keyof CmsSection, esKey: keyof CmsSection) => {
    if (!section) return undefined;
    return locale === 'es' ? (section[esKey] as string) || (section[enKey] as string) : (section[enKey] as string);
  };

  const heroHeading = pick(heroSection, 'heading', 'headingEs') || t('hero.heading');
  const heroSubheading = pick(heroSection, 'subheading', 'subheadingEs') || t('hero.subheading');
  const heroImage = heroSection?.imageUrl;

  const storyHeading = pick(storySection, 'heading', 'headingEs') || t('story.heading');
  const storyBody = pick(storySection, 'body', 'bodyEs') || t('story.body');
  const storyImage = storySection?.imageUrl;

  const valuesHeading = pick(valuesSection, 'heading', 'headingEs') || t('values.heading');

  const values = [
    { icon: '💎', title: t('values.item1Title'), desc: t('values.item1Desc') },
    { icon: '🌺', title: t('values.item2Title'), desc: t('values.item2Desc') },
    { icon: '✨', title: t('values.item3Title'), desc: t('values.item3Desc') },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section
          className="relative min-h-[420px] flex items-center justify-center overflow-hidden"
          style={heroImage ? { backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          {!heroImage && (
            <div className="absolute inset-0 bg-gray-950">
              <div className="absolute inset-0 opacity-30"
                style={{ backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%,rgba(217,119,6,0.3),transparent)' }}
              />
            </div>
          )}
          {heroImage && <div className="absolute inset-0 bg-black/55" />}
          <div className="relative z-10 text-center px-4 py-24">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/80 mb-4" data-aos="fade-down">
              Tienda en Línea
            </p>
            <h1 className="text-4xl md:text-6xl font-semibold text-white tracking-tight mb-4" data-aos="fade-up" data-aos-delay="100">
              {heroHeading}
            </h1>
            <p className="text-gray-300/80 max-w-lg mx-auto text-base" data-aos="fade-up" data-aos-delay="200">
              {heroSubheading}
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
            <div data-aos="fade-right">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-4">Our Story</p>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">{storyHeading}</h2>
              <div>
                {storyBody.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-gray-500 dark:text-gray-400 leading-relaxed mb-4 last:mb-0 text-base">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
            <div className="relative h-80 rounded-3xl overflow-hidden shadow-2xl" data-aos="fade-left" data-aos-delay="100">
              {storyImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={storyImage} alt={storyHeading} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-50 to-stone-100 dark:from-amber-900/30 dark:to-stone-800 flex items-center justify-center">
                  <span className="text-9xl opacity-10">🌸</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-gray-50 dark:bg-gray-900/40 py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-14" data-aos="fade-up">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3">What we stand for</p>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{valuesHeading}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {values.map((value, i) => (
                <div
                  key={value.title}
                  className="bg-white dark:bg-gray-900 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  data-aos="fade-up"
                  data-aos-delay={String(i * 100)}
                >
                  <div className="text-4xl mb-5">{value.icon}</div>
                  <h3 className="text-lg font-semibold mb-3">{value.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
