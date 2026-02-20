import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tienda.com' },
    update: {},
    create: {
      email: 'admin@tienda.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Store',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Deactivate old categories that don't belong to perfumes
  await prisma.category.updateMany({
    where: { slug: { in: ['electronics', 'clothing', 'home'] } },
    data: { isActive: false },
  });

  // Perfume categories
  const [niche, designer, arabic] = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'niche' },
      update: { isActive: true },
      create: {
        name: 'Niche',
        nameEs: 'Nicho',
        slug: 'niche',
        description: 'Exclusive fragrances from independent and artisan houses',
        imageUrl: 'https://images.unsplash.com/photo-1594913397394-d5b8be12b3be?w=400',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'designer' },
      update: { isActive: true },
      create: {
        name: 'Designer',
        nameEs: 'Diseñador',
        slug: 'designer',
        description: 'Iconic fragrances from the world\'s leading fashion houses',
        imageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'arabic' },
      update: { isActive: true },
      create: {
        name: 'Arabic',
        nameEs: 'Árabe',
        slug: 'arabic',
        description: 'Rich and opulent fragrances rooted in Middle Eastern tradition',
        imageUrl: 'https://images.unsplash.com/photo-1600336153113-d66c1d4f7793?w=400',
      },
    }),
  ]);
  console.log('✅ Perfume categories created');

  // Perfume products
  const products = [
    // Niche
    {
      name: 'Aventus', nameEs: 'Aventus',
      slug: 'aventus-creed',
      description: 'A bold, sophisticated fragrance celebrating strength, power and success. Opens with pineapple, birch and bergamot.',
      descriptionEs: 'Una fragancia audaz y sofisticada que celebra la fortaleza, el poder y el éxito. Abre con piña, abedul y bergamota.',
      price: 385.00, comparePrice: 420.00, stock: 15, sku: 'NCH-001',
      imageUrls: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400'],
      categoryId: niche.id, isFeatured: true,
    },
    {
      name: 'Black Orchid', nameEs: 'Orquídea Negra',
      slug: 'black-orchid-tf',
      description: 'A luxurious and sensual fragrance with rich dark accords and black orchids. Deep, mysterious and powerful.',
      descriptionEs: 'Una fragancia lujosa y sensual con ricos acordes oscuros y orquídeas negras. Profunda, misteriosa y poderosa.',
      price: 245.00, stock: 20, sku: 'NCH-002',
      imageUrls: ['https://images.unsplash.com/photo-1541643600914-78b084683702?w=400'],
      categoryId: niche.id, isFeatured: true,
    },
    {
      name: 'Baccarat Rouge 540', nameEs: 'Baccarat Rouge 540',
      slug: 'baccarat-rouge-540',
      description: 'A dazzling amber and floral fragrance that illuminates the skin. Jasmine, saffron, amberwood and fir resin.',
      descriptionEs: 'Una deslumbrante fragancia ambarina y floral que ilumina la piel. Jazmín, azafrán, madera de ámbar y resina de abeto.',
      price: 320.00, comparePrice: 350.00, stock: 12, sku: 'NCH-003',
      imageUrls: ['https://images.unsplash.com/photo-1588776814546-1ffbb29c17d6?w=400'],
      categoryId: niche.id, isFeatured: false,
    },
    // Designer
    {
      name: 'Sauvage', nameEs: 'Sauvage',
      slug: 'sauvage-dior',
      description: 'Raw and noble, wild and yet refined. A fresh and raw woody aromatic fragrance with bergamot and ambroxan.',
      descriptionEs: 'Crudo y noble, salvaje pero refinado. Una fragancia aromática amaderada fresca y cruda con bergamota y ambroxan.',
      price: 145.00, comparePrice: 165.00, stock: 40, sku: 'DSG-001',
      imageUrls: ['https://images.unsplash.com/photo-1594913397394-d5b8be12b3be?w=400'],
      categoryId: designer.id, isFeatured: true,
    },
    {
      name: 'Bleu de Chanel', nameEs: 'Bleu de Chanel',
      slug: 'bleu-de-chanel',
      description: 'An ode to masculine freedom. An aromatic-woody fragrance that defies the conventional and celebrates sensuality.',
      descriptionEs: 'Una oda a la libertad masculina. Una fragancia aromática y amaderada que desafía lo convencional y celebra la sensualidad.',
      price: 155.00, stock: 35, sku: 'DSG-002',
      imageUrls: ['https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400'],
      categoryId: designer.id, isFeatured: false,
    },
    {
      name: 'La Vie Est Belle', nameEs: 'La Vida Es Bella',
      slug: 'la-vie-est-belle',
      description: 'A radiant fragrance and a declaration of happiness. Iris and patchouli layered with a praline and vanilla base.',
      descriptionEs: 'Una fragancia radiante y una declaración de felicidad. Iris y pachulí sobre una base de praliné y vainilla.',
      price: 135.00, stock: 30, sku: 'DSG-003',
      imageUrls: ['https://images.unsplash.com/photo-1600336153113-d66c1d4f7793?w=400'],
      categoryId: designer.id, isFeatured: false,
    },
    // Arabic
    {
      name: "Oud Al Layl", nameEs: "Oud de la Noche",
      slug: 'oud-al-layl',
      description: 'A rich, smoky oud fragrance with deep saffron and rose. An opulent night-time fragrance of depth and mystery.',
      descriptionEs: 'Una rica fragancia de oud ahumado con profundo azafrán y rosa. Una opulenta fragancia nocturna de profundidad y misterio.',
      price: 195.00, comparePrice: 220.00, stock: 18, sku: 'ARB-001',
      imageUrls: ['https://images.unsplash.com/photo-1601295453926-62f21b49e6f2?w=400'],
      categoryId: arabic.id, isFeatured: true,
    },
    {
      name: 'Musk Tahara', nameEs: 'Musk Tahara',
      slug: 'musk-tahara',
      description: 'A clean, pure white musk fragrance with delicate floral notes. Light, sensual and universally appealing.',
      descriptionEs: 'Una fragancia de almizcle blanco puro con delicadas notas florales. Ligera, sensual y de atractivo universal.',
      price: 85.00, stock: 50, sku: 'ARB-002',
      imageUrls: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400'],
      categoryId: arabic.id, isFeatured: false,
    },
    {
      name: 'Rose Oud', nameEs: 'Rosa y Oud',
      slug: 'rose-oud',
      description: 'An exquisite blend of Bulgarian rose and precious oud wood. Romantic, warm and deeply oriental.',
      descriptionEs: 'Una exquisita mezcla de rosa búlgara y preciosa madera de oud. Romántico, cálido y profundamente oriental.',
      price: 165.00, stock: 22, sku: 'ARB-003',
      imageUrls: ['https://images.unsplash.com/photo-1541643600914-78b084683702?w=400'],
      categoryId: arabic.id, isFeatured: false,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, comparePrice: p.comparePrice ?? null },
    });
  }
  console.log('✅ Perfume products created:', products.length);
  // ─── CMS Site Settings ────────────────────────────────────────────────────
  const siteSettings = [
    { key: 'site_name', value: 'Scentify', type: 'text', label: 'Store Name', group: 'general' },
    { key: 'site_tagline', value: 'Discover Your Signature Scent', type: 'text', label: 'Tagline', group: 'general' },
    { key: 'site_logo_url', value: '', type: 'image', label: 'Logo URL', group: 'general' },
    { key: 'contact_email', value: 'contact@scentify.com', type: 'text', label: 'Contact Email', group: 'contact' },
    { key: 'contact_phone', value: '', type: 'text', label: 'Phone', group: 'contact' },
    { key: 'contact_address', value: '', type: 'text', label: 'Address', group: 'contact' },
    { key: 'social_instagram', value: 'https://instagram.com/scentify', type: 'url', label: 'Instagram', group: 'social' },
    { key: 'social_facebook', value: '', type: 'url', label: 'Facebook', group: 'social' },
    { key: 'social_tiktok', value: '', type: 'url', label: 'TikTok', group: 'social' },
    { key: 'social_whatsapp', value: '', type: 'url', label: 'WhatsApp', group: 'social' },
    { key: 'seo_title', value: 'Scentify — Premium Fragrances', type: 'text', label: 'SEO Title', group: 'seo' },
    { key: 'seo_description', value: 'Discover exclusive niche, designer and Arabic fragrances at Scentify.', type: 'text', label: 'SEO Description', group: 'seo' },
  ];

  for (const s of siteSettings) {
    await prisma.siteSetting.upsert({ where: { key: s.key }, update: {}, create: s });
  }
  console.log('✅ Site settings created:', siteSettings.length);

  // ─── CMS Sections ─────────────────────────────────────────────────────────
  const cmsSections = [
    {
      key: 'hero',
      label: 'Hero Banner',
      type: 'hero',
      order: 1,
      badge: 'Premium Fragrances',
      badgeEs: 'Fragancias Premium',
      heading: 'Discover Your Signature Scent',
      headingEs: 'Descubre Tu Fragancia Signature',
      subheading: 'Explore an exclusive collection of niche, designer, and Arabic fragrances from the world\'s finest houses.',
      subheadingEs: 'Explora una colección exclusiva de fragancias nicho, diseñador y árabes de las mejores casas del mundo.',
      imageUrl: '',
      ctaText: 'Shop Now',
      ctaTextEs: 'Comprar Ahora',
      ctaUrl: '/products',
      ctaText2: 'Explore Niche',
      ctaText2Es: 'Explorar Nicho',
      ctaUrl2: '/products?category=niche',
    },
    {
      key: 'announcement',
      label: 'Announcement Bar',
      type: 'announcement',
      order: 0,
      isActive: false,
      heading: '🚚 Free shipping on orders over $100',
      headingEs: '🚚 Envío gratis en pedidos mayores a $100',
      ctaText: 'Shop Now',
      ctaTextEs: 'Comprar',
      ctaUrl: '/products',
    },
    {
      key: 'featured_header',
      label: 'Featured Section Title',
      type: 'text',
      order: 2,
      heading: 'Featured Fragrances',
      headingEs: 'Fragancias Destacadas',
    },
    {
      key: 'promo_banner',
      label: 'Promo Banner',
      type: 'banner',
      order: 3,
      isActive: false,
      heading: 'New Arrivals — Spring Collection',
      headingEs: 'Nuevas Llegadas — Colección Primavera',
      subheading: 'Fresh floral and citrus fragrances just dropped.',
      subheadingEs: 'Fragancias florales y cítricas recién llegadas.',
      imageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=1200',
      ctaText: 'Discover',
      ctaTextEs: 'Descubrir',
      ctaUrl: '/products',
    },
    {
      key: 'newsletter',
      label: 'Newsletter Section',
      type: 'text',
      order: 4,
      heading: 'Stay in the Know',
      headingEs: 'Mantente al Día',
      subheading: 'Subscribe for exclusive drops, new arrivals and fragrance tips.',
      subheadingEs: 'Suscríbete para recibir novedades exclusivas y consejos sobre fragancias.',
    },
  ];

  for (const s of cmsSections) {
    await prisma.cmsSection.upsert({ where: { key: s.key }, update: {}, create: s });
  }
  console.log('✅ CMS sections created:', cmsSections.length);

  console.log('🎉 Seed complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
