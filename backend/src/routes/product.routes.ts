import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/products
router.get('/', async (req, res) => {
  const { category, featured, search, page = '1', limit = '12', sort = 'createdAt', order = 'desc' } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const where: Record<string, unknown> = { isActive: true };

  if (category) where.category = { slug: category };
  if (featured === 'true') where.isFeatured = true;
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { nameEs: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take: Number(limit),
        orderBy: { [sort as string]: order },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/products/:slug
router.get('/:slug', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug, isActive: true },
      include: {
        category: true,
        reviews: {
          include: { user: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
