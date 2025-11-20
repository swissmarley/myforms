import express from 'express';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = express.Router();

// Get analytics for a form
router.get('/form/:formId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const form = await prisma.form.findFirst({
      where: { id: req.params.formId, userId: req.userId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!form) {
      throw new AppError('Form not found', 404);
    }

    const responses = await prisma.response.findMany({
      where: { formId: req.params.formId },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    const totalResponses = responses.length;
    const completedResponses = responses.filter(r => r.completedAt).length;
    const completionRate = totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0;

    // Calculate average completion time
    const completedWithTime = responses.filter(r => r.completedAt && r.startedAt);
    const avgCompletionTime = completedWithTime.length > 0
      ? completedWithTime.reduce((sum, r) => {
          const time = new Date(r.completedAt!).getTime() - new Date(r.startedAt).getTime();
          return sum + time;
        }, 0) / completedWithTime.length
      : 0;

    // Question-level analytics
    const questionAnalytics = form.questions.map(question => {
      const questionAnswers = responses
        .flatMap(r => r.answers)
        .filter(a => a.questionId === question.id);

      let analytics: any = {
        questionId: question.id,
        questionTitle: question.title,
        questionType: question.type,
        responseCount: questionAnswers.length,
      };

      // Type-specific analytics
      if (['MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN'].includes(question.type)) {
        const options = (question.options as any)?.choices || [];
        const choiceCounts: Record<string, number> = {};

        questionAnswers.forEach(answer => {
          const values = Array.isArray(answer.value) ? answer.value : [answer.value];
          values.forEach((val: string) => {
            choiceCounts[val] = (choiceCounts[val] || 0) + 1;
          });
        });

        analytics.choiceDistribution = options.map((opt: string) => ({
          choice: opt,
          count: choiceCounts[opt] || 0,
          percentage: questionAnswers.length > 0
            ? ((choiceCounts[opt] || 0) / questionAnswers.length) * 100
            : 0,
        }));
      } else if (question.type === 'LINEAR_SCALE') {
        const scale = question.options as any;
        const min = scale?.min || 1;
        const max = scale?.max || 5;
        const scaleCounts: Record<number, number> = {};

        questionAnswers.forEach(answer => {
          const val = Number(answer.value);
          if (val >= min && val <= max) {
            scaleCounts[val] = (scaleCounts[val] || 0) + 1;
          }
        });

        analytics.scaleDistribution = Array.from({ length: max - min + 1 }, (_, i) => min + i).map(val => ({
          value: val,
          count: scaleCounts[val] || 0,
          percentage: questionAnswers.length > 0
            ? ((scaleCounts[val] || 0) / questionAnswers.length) * 100
            : 0,
        }));

        const sum = questionAnswers.reduce((s, a) => s + Number(a.value || 0), 0);
        analytics.average = questionAnswers.length > 0 ? sum / questionAnswers.length : 0;
      }

      return analytics;
    });

    // Response trends over time
    const dateGroups: Record<string, number> = {};
    responses.forEach(response => {
      if (response.completedAt) {
        const date = new Date(response.completedAt).toISOString().split('T')[0];
        dateGroups[date] = (dateGroups[date] || 0) + 1;
      }
    });

    const trends = Object.entries(dateGroups)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      formId: form.id,
      totalResponses,
      completedResponses,
      completionRate: Math.round(completionRate * 100) / 100,
      averageCompletionTime: Math.round(avgCompletionTime / 1000), // in seconds
      questionAnalytics,
      trends,
    });
  } catch (error) {
    next(error);
  }
});

// Export responses as CSV
router.get('/form/:formId/export/csv', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const form = await prisma.form.findFirst({
      where: { id: req.params.formId, userId: req.userId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!form) {
      throw new AppError('Form not found', 404);
    }

    const responses = await prisma.response.findMany({
      where: { formId: req.params.formId },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    // Generate CSV
    const headers = ['Response ID', 'Submitted At', 'Email', ...form.questions.map(q => q.title)];
    const rows = responses.map(response => {
      const row = [
        response.id,
        response.completedAt?.toISOString() || '',
        response.email || '',
        ...form.questions.map(question => {
          const answer = response.answers.find(a => a.questionId === question.id);
          if (!answer) return '';
          if (Array.isArray(answer.value)) {
            return answer.value.join('; ');
          }
          return String(answer.value || '');
        }),
      ];
      return row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
    });

    const csv = [headers.map(h => `"${h}"`).join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="form-${form.id}-responses.csv"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

// Export responses as JSON
router.get('/form/:formId/export/json', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const form = await prisma.form.findFirst({
      where: { id: req.params.formId, userId: req.userId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!form) {
      throw new AppError('Form not found', 404);
    }

    const responses = await prisma.response.findMany({
      where: { formId: req.params.formId },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="form-${form.id}-responses.json"`);
    res.json({ form, responses });
  } catch (error) {
    next(error);
  }
});

export default router;

