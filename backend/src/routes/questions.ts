import express from 'express';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = express.Router();

const questionSchema = z.object({
  type: z.enum([
    'MULTIPLE_CHOICE',
    'CHECKBOXES',
    'SHORT_ANSWER',
    'LONG_ANSWER',
    'DROPDOWN',
    'LINEAR_SCALE',
    'DATE',
    'TIME',
    'DATETIME',
    'FILE_UPLOAD',
    'RICH_TEXT',
  ]),
  title: z.string().min(1),
  description: z.string().optional(),
  required: z.boolean().default(false),
  order: z.number().int(),
  validation: z.any().optional(),
  options: z.any().optional(),
  settings: z.any().optional(),
  conditional: z.any().optional(),
});

// Get all questions for a form
router.get('/form/:formId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    // Verify form ownership
    const form = await prisma.form.findFirst({
      where: { id: req.params.formId, userId: req.userId },
    });

    if (!form) {
      throw new AppError('Form not found', 404);
    }

    const questions = await prisma.question.findMany({
      where: { formId: req.params.formId },
      orderBy: { order: 'asc' },
    });

    res.json({ questions });
  } catch (error) {
    next(error);
  }
});

// Create question
router.post('/form/:formId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const form = await prisma.form.findFirst({
      where: { id: req.params.formId, userId: req.userId },
    });

    if (!form) {
      throw new AppError('Form not found', 404);
    }

    const data = questionSchema.parse(req.body);
    const question = await prisma.question.create({
      data: {
        ...data,
        formId: req.params.formId,
      },
    });

    res.status(201).json({ question });
  } catch (error) {
    next(error);
  }
});

// Update question
router.patch('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const question = await prisma.question.findUnique({
      where: { id: req.params.id },
      include: { form: true },
    });

    if (!question || question.form.userId !== req.userId) {
      throw new AppError('Question not found', 404);
    }

    const updateData = questionSchema.partial().parse(req.body);
    const updatedQuestion = await prisma.question.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ question: updatedQuestion });
  } catch (error) {
    next(error);
  }
});

// Delete question
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const question = await prisma.question.findUnique({
      where: { id: req.params.id },
      include: { form: true },
    });

    if (!question || question.form.userId !== req.userId) {
      throw new AppError('Question not found', 404);
    }

    await prisma.question.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Reorder questions
router.patch('/form/:formId/reorder', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const form = await prisma.form.findFirst({
      where: { id: req.params.formId, userId: req.userId },
    });

    if (!form) {
      throw new AppError('Form not found', 404);
    }

    const { questionIds } = z.object({
      questionIds: z.array(z.string().uuid()),
    }).parse(req.body);

    // Update order for each question
    await Promise.all(
      questionIds.map((id, index) =>
        prisma.question.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    res.json({ message: 'Questions reordered successfully' });
  } catch (error) {
    next(error);
  }
});

// Duplicate question
router.post('/:id/duplicate', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const originalQuestion = await prisma.question.findUnique({
      where: { id: req.params.id },
      include: { form: true },
    });

    if (!originalQuestion || originalQuestion.form.userId !== req.userId) {
      throw new AppError('Question not found', 404);
    }

    const { id, formId, createdAt, updatedAt, ...questionData } = originalQuestion;

    const duplicatedQuestion = await prisma.question.create({
      data: {
        ...questionData,
        formId,
        order: questionData.order + 1,
      },
    });

    res.status(201).json({ question: duplicatedQuestion });
  } catch (error) {
    next(error);
  }
});

export default router;

