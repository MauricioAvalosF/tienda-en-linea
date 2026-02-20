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

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: { name: 'Electronics', nameEs: 'Electrónica', slug: 'electronics', description: 'Electronic devices and accessories' },
    }),
    prisma.category.upsert({
      where: { slug: 'clothing' },
      update: {},
      create: { name: 'Clothing', nameEs: 'Ropa', slug: 'clothing', description: 'Apparel and fashion' },
    }),
    prisma.category.upsert({
      where: { slug: 'home' },
      update: {},
      create: { name: 'Home & Garden', nameEs: 'Hogar y Jardín', slug: 'home', description: 'Home decor and garden' },
    }),
  ]);
  console.log('✅ Categories created:', categories.length);

  // Sample products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: 'wireless-headphones' },
      update: {},
      create: {
        name: 'Wireless Headphones',
        nameEs: 'Auriculares Inalámbricos',
        slug: 'wireless-headphones',
        description: 'Premium wireless headphones with noise cancellation',
        descriptionEs: 'Auriculares inalámbricos premium con cancelación de ruido',
        price: 89.99,
        comparePrice: 129.99,
        stock: 50,
        sku: 'WH-001',
        imageUrls: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'],
        categoryId: categories[0].id,
        isFeatured: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'casual-tshirt' },
      update: {},
      create: {
        name: 'Casual T-Shirt',
        nameEs: 'Camiseta Casual',
        slug: 'casual-tshirt',
        description: 'Comfortable cotton t-shirt for everyday wear',
        descriptionEs: 'Camiseta de algodón cómoda para uso diario',
        price: 24.99,
        stock: 100,
        sku: 'TS-001',
        imageUrls: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'],
        categoryId: categories[1].id,
        isFeatured: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'desk-lamp' },
      update: {},
      create: {
        name: 'LED Desk Lamp',
        nameEs: 'Lámpara de Escritorio LED',
        slug: 'desk-lamp',
        description: 'Adjustable LED desk lamp with USB charging port',
        descriptionEs: 'Lámpara de escritorio LED ajustable con puerto USB',
        price: 39.99,
        stock: 30,
        sku: 'DL-001',
        imageUrls: ['https://images.unsplash.com/photo-1542382257-80dedb725088?w=400'],
        categoryId: categories[2].id,
        isFeatured: false,
      },
    }),
  ]);
  console.log('✅ Products created:', products.length);

  console.log('🎉 Seed complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
