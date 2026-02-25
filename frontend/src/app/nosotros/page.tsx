import { getTranslations } from 'next-intl/server';
import { getLocale } from 'next-intl/server';
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
    {
      icon: '💎',
      title: t('values.item1Title'),
      desc: t('values.item1Desc'),
    },
    {
      icon: '🌺',
      title: t('values.item2Title'),
      desc: t('values.item2Desc'),
    },
    {
      icon: '✨',
      title: t('values.item3Title'),
      desc: t('values.item3Desc'),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section
          className="relative h-80 md:h-96 flex items-center justify-center overflow-hidden"
          style={heroImage ? { backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          {!heroImage && (
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900" />
          )}
          {heroImage && <div className="absolute inset-0 bg-black/50" />}
          <div className="relative z-10 text-center px-4">
            <p className="text-amber-300 text-sm uppercase tracking-widest font-medium mb-3">Maison de Parfum</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{heroHeading}</h1>
            <p className="text-lg text-gray-200 max-w-xl mx-auto">{heroSubheading}</p>
          </div>
        </section>

        {/* Story */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-amber-700 dark:text-amber-400">{storyHeading}</h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                {storyBody.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl">
              {storyImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={storyImage} alt={storyHeading} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-stone-800 flex items-center justify-center">
                  <span className="text-8xl opacity-30">🌸</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-gray-50 dark:bg-gray-900/50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{valuesHeading}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="text-5xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold mb-3 text-amber-700 dark:text-amber-400">{value.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{value.desc}</p>
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
