import express from 'express';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = express.Router();

const submitResponseSchema = z.object({
  formId: z.string().uuid(),
  email: z.string().email().optional(),
  answers: z.array(z.object({
    questionId: z.string().uuid(),
    value: z.any(),
    fileUrl: z.string().optional(),
  })),
});

// Submit response (public)
router.post('/submit', async (req, res, next) => {
  try {
    const data = submitResponseSchema.parse(req.body);
    const form = await prisma.form.findUnique({
      where: { id: data.formId },
      include: { questions: true },
    });

    if (!form || form.status !== 'PUBLISHED') {
      throw new AppError('Form not found or not published', 404);
    }

    if (form.expiresAt && new Date(form.expiresAt) < new Date()) {
      throw new AppError('Form has expired', 410);
    }

    if (form.responseLimit) {
      const responseCount = await prisma.response.count({
        where: { formId: form.id, completedAt: { not: null } },
      });
      if (responseCount >= form.responseLimit) {
        throw new AppError('Response limit reached', 429);
      }
    }

    // Check if multiple responses allowed
    if (!form.allowMultiple) {
      const existingResponse = await prisma.response.findFirst({
        where: {
          formId: form.id,
          ipAddress: req.ip || req.socket.remoteAddress,
        },
      });
      if (existingResponse) {
        throw new AppError('Multiple responses not allowed', 403);
      }
    }

    // Validate answers
    for (const answer of data.answers) {
      const question = form.questions.find(q => q.id === answer.questionId);
      if (!question) {
        throw new AppError(`Question ${answer.questionId} not found`, 400);
      }
      if (question.required && (!answer.value || answer.value === '')) {
        throw new AppError(`Question "${question.title}" is required`, 400);
      }
    }

    const response = await prisma.response.create({
      data: {
        formId: data.formId,
        email: data.email,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        completedAt: new Date(),
        answers: {
          create: data.answers.map(a => ({
            questionId: a.questionId,
            value: a.value,
            fileUrl: a.fileUrl,
          })),
        },
      },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    res.status(201).json({ response });
  } catch (error) {
    next(error);
  }
});

// Get responses for a form (authenticated)
router.get('/form/:formId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const form = await prisma.form.findFirst({
      where: { id: req.params.formId, userId: req.userId },
    });

    if (!form) {
      throw new AppError('Form not found', 404);
    }

    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [responses, total] = await Promise.all([
      prisma.response.findMany({
        where: { formId: req.params.formId },
        include: {
          answers: {
            include: {
              question: true,
            },
          },
        },
        orderBy: { completedAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.response.count({
        where: { formId: req.params.formId },
      }),
    ]);

    res.json({
      responses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single response
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const response = await prisma.response.findUnique({
      where: { id: req.params.id },
      include: {
        form: true,
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!response || response.form.userId !== req.userId) {
      throw new AppError('Response not found', 404);
    }

    res.json({ response });
  } catch (error) {
    next(error);
  }
});

// Delete response
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const response = await prisma.response.findUnique({
      where: { id: req.params.id },
      include: { form: true },
    });

    if (!response || response.form.userId !== req.userId) {
      throw new AppError('Response not found', 404);
    }

    await prisma.response.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Response deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

