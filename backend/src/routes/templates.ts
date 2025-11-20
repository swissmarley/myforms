import express from 'express';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = express.Router();

const createTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string(),
  formData: z.any(),
  isPublic: z.boolean().default(false),
});

// Get all templates
router.get('/', async (req, res, next) => {
  try {
    const { category, publicOnly } = req.query;
    const where: any = {};

    if (publicOnly === 'true') {
      where.isPublic = true;
    }
    if (category) {
      where.category = category;
    }

    const templates = await prisma.formTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ templates });
  } catch (error) {
    next(error);
  }
});

// Create template
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = createTemplateSchema.parse(req.body);
    const template = await prisma.formTemplate.create({
      data,
    });

    res.status(201).json({ template });
  } catch (error) {
    next(error);
  }
});

// Get template by ID
router.get('/:id', async (req, res, next) => {
  try {
    const template = await prisma.formTemplate.findUnique({
      where: { id: req.params.id },
    });

    if (!template) {
      throw new AppError('Template not found', 404);
    }

    res.json({ template });
  } catch (error) {
    next(error);
  }
});

export default router;

