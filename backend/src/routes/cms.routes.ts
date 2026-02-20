import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/cms — all active sections + settings (public)
router.get('/', async (_req, res) => {
  try {
    const [sections, settings] = await Promise.all([
      prisma.cmsSection.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
      prisma.siteSetting.findMany({ orderBy: { group: 'asc' } }),
    ]);
    res.json({ sections, settings });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/cms/sections/:key
router.get('/sections/:key', async (req, res) => {
  try {
    const section = await prisma.cmsSection.findUnique({ where: { key: req.params.key } });
    if (!section) return res.status(404).json({ error: 'Section not found' });
    res.json(section);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/cms/settings/:key
router.get('/settings/:key', async (req, res) => {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: req.params.key } });
    if (!setting) return res.status(404).json({ error: 'Setting not found' });
    res.json(setting);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
