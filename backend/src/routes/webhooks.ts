import express from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = express.Router();

const webhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()),
  secret: z.string().optional(),
});

// Get webhooks for a form
router.get('/form/:formId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const form = await prisma.form.findFirst({
      where: { id: req.params.formId, userId: req.userId },
    });

    if (!form) {
      throw new AppError('Form not found', 404);
    }

    const webhooks = await prisma.webhook.findMany({
      where: { formId: req.params.formId },
    });

    res.json({ webhooks });
  } catch (error) {
    next(error);
  }
});

// Create webhook
router.post('/form/:formId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const form = await prisma.form.findFirst({
      where: { id: req.params.formId, userId: req.userId },
    });

    if (!form) {
      throw new AppError('Form not found', 404);
    }

    const data = webhookSchema.parse(req.body);
    const webhook = await prisma.webhook.create({
      data: {
        ...data,
        formId: req.params.formId,
        secret: data.secret || uuidv4(),
      },
    });

    res.status(201).json({ webhook });
  } catch (error) {
    next(error);
  }
});

// Update webhook
router.patch('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const webhook = await prisma.webhook.findUnique({
      where: { id: req.params.id },
      include: { form: { select: { userId: true } } },
    });

    if (!webhook || webhook.form.userId !== req.userId) {
      throw new AppError('Webhook not found', 404);
    }

    const updateData = webhookSchema.partial().parse(req.body);
    const updated = await prisma.webhook.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ webhook: updated });
  } catch (error) {
    next(error);
  }
});

// Delete webhook
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const webhook = await prisma.webhook.findUnique({
      where: { id: req.params.id },
      include: { form: { select: { userId: true } } },
    });

    if (!webhook || webhook.form.userId !== req.userId) {
      throw new AppError('Webhook not found', 404);
    }

    await prisma.webhook.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Webhook deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

