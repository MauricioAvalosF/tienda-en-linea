import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// POST /api/discounts/validate — validate a coupon code for the current user
router.post('/validate', authenticate, async (req: AuthRequest, res) => {
  const { code, cartTotal } = req.body;

  if (!code) return res.status(400).json({ error: 'Coupon code is required' });

  try {
    const discount = await prisma.discount.findUnique({
      where: { code },
      include: { group: { select: { id: true, name: true } } },
    });

    if (!discount || !discount.isActive) {
      return res.status(404).json({ error: 'Invalid or inactive coupon code' });
    }

    const now = new Date();
    if (discount.startsAt && discount.startsAt > now) {
      return res.status(400).json({ error: 'Coupon is not yet active' });
    }
    if (discount.expiresAt && discount.expiresAt < now) {
      return res.status(400).json({ error: 'Coupon has expired' });
    }
    if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
      return res.status(400).json({ error: 'Coupon usage limit reached' });
    }

    // Check group restriction
    if (discount.groupId) {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { groupId: true },
      });
      if (user?.groupId !== discount.groupId) {
        return res.status(403).json({ error: 'This coupon is not available for your membership group' });
      }
    }

    // Check minimum order amount
    const total = Number(cartTotal) || 0;
    if (discount.minOrderAmount && total < discount.minOrderAmount) {
      return res.status(400).json({
        error: `Minimum order of $${discount.minOrderAmount.toFixed(2)} required`,
      });
    }

    // Calculate savings preview
    let savingsAmount = 0;
    if (discount.type === 'PERCENTAGE') {
      savingsAmount = total * (discount.value / 100);
    } else if (discount.type === 'FIXED') {
      savingsAmount = Math.min(discount.value, total);
    } else if (discount.type === 'FREE_SHIPPING') {
      savingsAmount = 9.99; // standard shipping cost
    }

    return res.json({
      valid: true,
      discount: {
        id: discount.id,
        name: discount.name,
        code: discount.code,
        type: discount.type,
        value: discount.value,
      },
      savingsAmount: Math.round(savingsAmount * 100) / 100,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
