/**
 * One-time script: replace broken Unsplash image URLs in products, categories and CMS.
 * Run with: npx tsx src/prisma/fix-images.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BASE = 'https://images.unsplash.com/photo-';

async function main() {
  console.log('🖼  Fixing broken image URLs...');

  // ── Products ──────────────────────────────────────────────────────────────
  const productFixes: { slug: string; imageUrls: string[] }[] = [
    {
      slug: 'black-orchid-tf',
      imageUrls: [`${BASE}1563170351-be82bc888aa4?w=600`],
    },
    {
      slug: 'baccarat-rouge-540',
      imageUrls: [`${BASE}1617897903246-719242758050?w=600`],
    },
    {
      slug: 'sauvage-dior',
      imageUrls: [`${BASE}1585386959984-a4155224a1ad?w=600`],
    },
    {
      slug: 'bleu-de-chanel',
      imageUrls: [`${BASE}1619994403073-2cec844b8e63?w=600`],
    },
    {
      slug: 'la-vie-est-belle',
      imageUrls: [`${BASE}1557825835-70d97c4aa567?w=600`],
    },
    {
      slug: 'oud-al-layl',
      imageUrls: [`${BASE}1556909114-f6e7ad7d3136?w=600`],
    },
    {
      slug: 'rose-oud',
      imageUrls: [`${BASE}1631729371254-42c2892f0e6e?w=600`],
    },
    // Keep working ones but upgrade resolution
    {
      slug: 'aventus-creed',
      imageUrls: [`${BASE}1592945403244-b3fbafd7f539?w=600`],
    },
    {
      slug: 'musk-tahara',
      imageUrls: [`${BASE}1608528577891-eb055944f2e7?w=600`],
    },
  ];

  for (const fix of productFixes) {
    await prisma.product.update({
      where: { slug: fix.slug },
      data: { imageUrls: fix.imageUrls },
    });
    console.log(`  ✅ ${fix.slug}`);
  }

  // ── Categories ────────────────────────────────────────────────────────────
  const categoryFixes: { slug: string; imageUrl: string }[] = [
    {
      slug: 'niche',
      imageUrl: `${BASE}1571781926291-c477ebfd024b?w=400`,
    },
    {
      slug: 'designer',
      imageUrl: `${BASE}1515377905703-c4788e51af15?w=400`,
    },
    {
      slug: 'arabic',
      imageUrl: `${BASE}1604654894610-df63bc536371?w=400`,
    },
  ];

  for (const fix of categoryFixes) {
    await prisma.category.update({
      where: { slug: fix.slug },
      data: { imageUrl: fix.imageUrl },
    });
    console.log(`  ✅ category/${fix.slug}`);
  }

  // ── CMS Hero image ────────────────────────────────────────────────────────
  await prisma.cmsSection.update({
    where: { key: 'hero' },
    data: {
      imageUrl: `${BASE}1549388604-817d15aa0110?w=1400&q=80`,
    },
  });
  console.log('  ✅ hero image');

  console.log('\n🎉 All images fixed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
