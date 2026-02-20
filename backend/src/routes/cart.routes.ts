import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// GET /api/cart
router.get('/', async (req: AuthRequest, res) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, nameEs: true, price: true, imageUrls: true, stock: true, slug: true } },
          },
        },
      },
    });
    res.json(cart || { items: [] });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/cart/items
router.post('/items', async (req: AuthRequest, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId required' });

  try {
    const product = await prisma.product.findUnique({ where: { id: productId, isActive: true } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ error: 'Insufficient stock' });

    let cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user!.id } });
    }

    const item = await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { quantity: { increment: quantity } },
      create: { cartId: cart.id, productId, quantity },
      include: { product: true },
    });

    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/cart/items/:productId
router.patch('/items/:productId', async (req: AuthRequest, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) return res.status(400).json({ error: 'Invalid quantity' });

  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const item = await prisma.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId: req.params.productId } },
      data: { quantity },
    });
    res.json(item);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/cart/items/:productId
router.delete('/items/:productId', async (req: AuthRequest, res) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    await prisma.cartItem.delete({
      where: { cartId_productId: { cartId: cart.id, productId: req.params.productId } },
    });
    res.json({ message: 'Item removed' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/cart
router.delete('/', async (req: AuthRequest, res) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    res.json({ message: 'Cart cleared' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
