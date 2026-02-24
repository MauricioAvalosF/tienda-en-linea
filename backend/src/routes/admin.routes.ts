import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, requireAdmin);

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────

// GET /api/admin/stats
router.get('/stats', async (_req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, revenue] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.aggregate({ where: { status: 'PAID' }, _sum: { total: true } }),
    ]);

    // Orders per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentOrders = await prisma.order.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, total: true, status: true },
      orderBy: { createdAt: 'desc' },
    });

    // Low stock products
    const lowStock = await prisma.product.findMany({
      where: { stock: { lte: 5 }, isActive: true },
      select: { id: true, name: true, stock: true, imageUrls: true },
      orderBy: { stock: 'asc' },
      take: 10,
    });

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: revenue._sum.total || 0,
      recentOrders: recentOrders.slice(0, 10),
      lowStock,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

// GET /api/admin/notifications?since=<ISO timestamp>
router.get('/notifications', async (req, res) => {
  try {
    const since = req.query.since ? new Date(req.query.since as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [recent, unreadCount] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        select: {
          id: true,
          status: true,
          total: true,
          createdAt: true,
          user: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.order.count({ where: { createdAt: { gte: since } } }),
    ]);
    res.json({ orders: recent, unreadCount });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── PRODUCTS CRUD ───────────────────────────────────────────────────────────

router.get('/products', async (req, res) => {
  const { page = '1', limit = '20', search } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const where: Record<string, unknown> = {};
  if (search) where.OR = [
    { name: { contains: search as string, mode: 'insensitive' } },
    { sku: { contains: search as string, mode: 'insensitive' } },
  ];

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, include: { category: true }, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
      prisma.product.count({ where }),
    ]);
    res.json({ products, total, pages: Math.ceil(total / Number(limit)) });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/products', async (req, res) => {
  const { name, nameEs, slug, description, descriptionEs, price, comparePrice, stock, sku, imageUrls, categoryId, isFeatured, weight } = req.body;

  try {
    const product = await prisma.product.create({
      data: { name, nameEs, slug, description, descriptionEs, price, comparePrice, stock, sku, imageUrls: imageUrls || [], categoryId, isFeatured: isFeatured || false, weight },
      include: { category: true },
    });
    res.status(201).json(product);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') return res.status(409).json({ error: 'Slug or SKU already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
      include: { category: true },
    });
    res.json(product);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ message: 'Product deactivated' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── CATEGORIES CRUD ─────────────────────────────────────────────────────────

router.get('/categories', async (_req, res) => {
  try {
    const cats = await prisma.category.findMany({ include: { _count: { select: { products: true } } } });
    res.json(cats);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/categories', async (req, res) => {
  const { name, nameEs, slug, description, imageUrl } = req.body;
  try {
    const cat = await prisma.category.create({ data: { name, nameEs, slug, description, imageUrl } });
    res.status(201).json(cat);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/categories/:id', async (req, res) => {
  try {
    const cat = await prisma.category.update({ where: { id: req.params.id }, data: req.body });
    res.json(cat);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── ORDERS ──────────────────────────────────────────────────────────────────

router.get('/orders', async (req, res) => {
  const { page = '1', limit = '20', status } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  try {
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          items: { include: { product: { select: { name: true } } } },
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);
    res.json({ orders, total, pages: Math.ceil(total / Number(limit)) });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const order = await prisma.order.update({ where: { id: req.params.id }, data: { status } });
    res.json(order);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── MEMBER GROUPS ───────────────────────────────────────────────────────────

router.get('/groups', async (_req, res) => {
  try {
    const groups = await prisma.memberGroup.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(groups);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/groups', async (req, res) => {
  const { name, description, color } = req.body;
  try {
    const group = await prisma.memberGroup.create({ data: { name, description, color } });
    res.status(201).json(group);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') return res.status(409).json({ error: 'Group name already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/groups/:id', async (req, res) => {
  try {
    const group = await prisma.memberGroup.update({ where: { id: req.params.id }, data: req.body });
    res.json(group);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/groups/:id', async (req, res) => {
  try {
    const userCount = await prisma.user.count({ where: { groupId: req.params.id } });
    if (userCount > 0) return res.status(400).json({ error: 'Cannot delete group with assigned users' });
    await prisma.memberGroup.delete({ where: { id: req.params.id } });
    res.json({ message: 'Group deleted' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── DISCOUNTS CRUD ──────────────────────────────────────────────────────────

router.get('/discounts', async (_req, res) => {
  try {
    const discounts = await prisma.discount.findMany({
      include: { group: { select: { id: true, name: true, color: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(discounts);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/discounts', async (req, res) => {
  const { name, code, type, value, minOrderAmount, maxUses, isActive, startsAt, expiresAt, groupId } = req.body;
  try {
    const discount = await prisma.discount.create({
      data: {
        name,
        code: code || null,
        type,
        value: Number(value),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
        maxUses: maxUses ? Number(maxUses) : null,
        isActive: isActive !== false,
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        groupId: groupId || null,
      },
      include: { group: { select: { id: true, name: true, color: true } } },
    });
    res.status(201).json(discount);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') return res.status(409).json({ error: 'Coupon code already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/discounts/:id', async (req, res) => {
  try {
    const data: Record<string, unknown> = { ...req.body };
    if ('value' in data) data.value = Number(data.value);
    if ('minOrderAmount' in data) data.minOrderAmount = data.minOrderAmount ? Number(data.minOrderAmount) : null;
    if ('maxUses' in data) data.maxUses = data.maxUses ? Number(data.maxUses) : null;
    if ('startsAt' in data) data.startsAt = data.startsAt ? new Date(data.startsAt as string) : null;
    if ('expiresAt' in data) data.expiresAt = data.expiresAt ? new Date(data.expiresAt as string) : null;
    if ('groupId' in data) data.groupId = data.groupId || null;
    if ('code' in data) data.code = data.code || null;
    const discount = await prisma.discount.update({
      where: { id: req.params.id },
      data,
      include: { group: { select: { id: true, name: true, color: true } } },
    });
    res.json(discount);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/discounts/:id', async (req, res) => {
  try {
    await prisma.discount.delete({ where: { id: req.params.id } });
    res.json({ message: 'Discount deleted' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── USERS ───────────────────────────────────────────────────────────────────

router.get('/users', async (req, res) => {
  const { page = '1', limit = '20', search } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const where: Record<string, unknown> = {};
  if (search) where.OR = [
    { email: { contains: search as string, mode: 'insensitive' } },
    { firstName: { contains: search as string, mode: 'insensitive' } },
  ];

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          group: { select: { id: true, name: true, color: true } },
          _count: { select: { orders: true } },
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);
    res.json({ users, total, pages: Math.ceil(total / Number(limit)) });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/users/:id', async (req: AuthRequest, res) => {
  if (req.params.id === req.user!.id) return res.status(400).json({ error: 'Cannot modify yourself' });
  try {
    const data = { ...req.body };
    if ('groupId' in data) data.groupId = data.groupId || null;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        group: { select: { id: true, name: true, color: true } },
      },
    });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── CMS SECTIONS ────────────────────────────────────────────────────────────

router.get('/cms/sections', async (_req, res) => {
  try {
    const sections = await prisma.cmsSection.findMany({ orderBy: { order: 'asc' } });
    res.json(sections);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/cms/sections', async (req, res) => {
  try {
    const section = await prisma.cmsSection.create({ data: req.body });
    res.status(201).json(section);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') return res.status(409).json({ error: 'Section key already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/cms/sections/:key', async (req, res) => {
  try {
    const section = await prisma.cmsSection.update({ where: { key: req.params.key }, data: req.body });
    res.json(section);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/cms/sections/:key', async (req, res) => {
  try {
    await prisma.cmsSection.delete({ where: { key: req.params.key } });
    res.json({ message: 'Section deleted' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── CMS SETTINGS ────────────────────────────────────────────────────────────

router.get('/cms/settings', async (_req, res) => {
  try {
    const settings = await prisma.siteSetting.findMany({ orderBy: [{ group: 'asc' }, { label: 'asc' }] });
    res.json(settings);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/cms/settings/:key', async (req, res) => {
  try {
    const setting = await prisma.siteSetting.upsert({
      where: { key: req.params.key },
      update: { value: req.body.value },
      create: { key: req.params.key, value: req.body.value, label: req.body.label || req.params.key, group: req.body.group || 'general', type: req.body.type || 'text' },
    });
    res.json(setting);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
