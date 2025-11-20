import express from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = express.Router();

const createFormSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  theme: z.any().optional(),
  settings: z.any().optional(),
  allowMultiple: z.boolean().optional(),
});

const updateFormSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  password: z.string().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  responseLimit: z.number().int().positive().optional().nullable(),
  allowMultiple: z.boolean().optional(),
  collectEmail: z.boolean().optional(),
  showProgress: z.boolean().optional(),
  confirmationMsg: z.string().optional(),
  theme: z.any().optional(),
  settings: z.any().optional(),
  folderId: z.string().uuid().optional().nullable(),
});

// Get all forms for user
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { status, folderId } = req.query;
    const where: any = { userId: req.userId };

    if (status) {
      where.status = status;
    }
    if (folderId) {
      where.folderId = folderId;
    }

    const forms = await prisma.form.findMany({
      where,
      include: {
        _count: {
          select: { responses: true, questions: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ forms });
  } catch (error) {
    next(error);
  }
});

// Get single form
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const form = await prisma.form.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { responses: true },
        },
      },
    });

    if (!form) {
      throw new AppError('Form not found', 404);
    }

    res.json({ form });
  } catch (error) {
    next(error);
  }
});

// Get form by shareable URL (public)
router.get('/public/:shareableUrl', async (req, res, next) => {
  try {
    const form = await prisma.form.findUnique({
      where: { shareableUrl: req.params.shareableUrl },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!form || form.status !== 'PUBLISHED') {
      throw new AppError('Form not found', 404);
    }

    if (form.expiresAt && new Date(form.expiresAt) < new Date()) {
      throw new AppError('Form has expired', 410);
    }

    // Don't send password or sensitive data
    const { password, ...publicForm } = form;
    res.json({ form: publicForm });
  } catch (error) {
    next(error);
  }
});

// Create form
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = createFormSchema.parse(req.body);
    const shareableUrl = uuidv4().replace(/-/g, '').substring(0, 16);

    const form = await prisma.form.create({
      data: {
        ...data,
        userId: req.userId!,
        shareableUrl,
        allowMultiple: data.allowMultiple ?? true,
        allowMultipleConfigured: data.allowMultiple !== undefined,
      },
      include: {
        questions: true,
      },
    });

    res.status(201).json({ form });
  } catch (error) {
    next(error);
  }
});

// Update form
router.patch('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = updateFormSchema.parse(req.body);
    const formId = req.params.id;

    // Verify ownership
    const existingForm = await prisma.form.findFirst({
      where: { id: formId, userId: req.userId },
    });

    if (!existingForm) {
      throw new AppError('Form not found', 404);
    }

    // Handle status change to PUBLISHED
    if (data.status === 'PUBLISHED' && existingForm.status !== 'PUBLISHED') {
      data.publishedAt = new Date();
    }

    // Increment version on significant changes
    const updateData: any = { ...data };
    if (data.allowMultiple !== undefined) {
      updateData.allowMultipleConfigured = true;
    }
    if (data.status || data.title || data.theme) {
      updateData.version = { increment: 1 };
    }

    const form = await prisma.form.update({
      where: { id: formId },
      data: updateData,
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    res.json({ form });
  } catch (error) {
    next(error);
  }
});

// Delete form
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const form = await prisma.form.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!form) {
      throw new AppError('Form not found', 404);
    }

    await prisma.form.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Duplicate form
router.post('/:id/duplicate', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const originalForm = await prisma.form.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { questions: true },
    });

    if (!originalForm) {
      throw new AppError('Form not found', 404);
    }

    const shareableUrl = uuidv4().replace(/-/g, '').substring(0, 16);
    const { id, userId, createdAt, updatedAt, publishedAt, ...formData } = originalForm;

    const duplicatedForm = await prisma.form.create({
      data: {
        ...formData,
        title: `${formData.title} (Copy)`,
        shareableUrl,
        userId: req.userId!,
        status: 'DRAFT',
        questions: {
          create: originalForm.questions.map(({ id, formId, createdAt, updatedAt, ...q }) => q),
        },
      },
      include: {
        questions: true,
      },
    });

    res.status(201).json({ form: duplicatedForm });
  } catch (error) {
    next(error);
  }
});

// Generate QR code data
router.get('/:id/qrcode', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const form = await prisma.form.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!form) {
      throw new AppError('Form not found', 404);
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const formUrl = `${baseUrl}/form/${form.shareableUrl}`;

    res.json({ url: formUrl, shareableUrl: form.shareableUrl });
  } catch (error) {
    next(error);
  }
});

export default router;
