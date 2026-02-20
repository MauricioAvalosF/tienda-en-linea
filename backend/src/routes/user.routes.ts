import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// GET /api/users/profile
router.get('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, createdAt: true, addresses: true },
    });
    return res.json(user);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/users/profile
router.patch('/profile', [
  body('firstName').optional().notEmpty().trim(),
  body('lastName').optional().notEmpty().trim(),
  body('phone').optional().trim(),
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { firstName, lastName, phone } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { firstName, lastName, phone },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true },
    });
    return res.json(user);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/users/password
router.patch('/password', [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { currentPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user!.id }, data: { password: hashed } });

    return res.json({ message: 'Password updated' });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/users/addresses
router.post('/addresses', async (req: AuthRequest, res: Response) => {
  const { label, street, city, state, country, postalCode, isDefault } = req.body;

  try {
    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } });
    }

    const address = await prisma.address.create({
      data: { userId: req.user!.id, label, street, city, state, country, postalCode, isDefault: isDefault || false },
    });
    return res.status(201).json(address);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/users/addresses/:id
router.delete('/addresses/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.address.deleteMany({ where: { id: req.params.id, userId: req.user!.id } });
    return res.json({ message: 'Address deleted' });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
