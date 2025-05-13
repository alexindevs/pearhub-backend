import { z } from 'zod';

export const AnalyticsQuerySchema = z.object({
  type: z.enum(['daily', 'weekly', 'monthly']).optional(),
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'day must be in YYYY-MM-DD format',
  }).optional(),
  week: z.enum(['current', 'previous']).optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/, {
    message: 'month must be in YYYY-MM format',
  }).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});
