import { z } from 'zod';

export const ContentSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['TEXT', 'LONGFORM', 'IMAGE', 'LINK']),
  body: z.string().min(1),
  mediaUrl: z.string().url().optional(),
  tags: z.array(z.string()),
}).superRefine((data, ctx) => {
  if (['TEXT', 'LONGFORM'].includes(data.type)) {
    const max = data.type === 'LONGFORM' ? 3000 : 1000;
    if (data.body.length > max) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        maximum: max,
        type: 'string',
        inclusive: true,
        message: `Body too long for ${data.type}. Max length is ${max} characters.`,
        path: ['body'],
      });
    }
  }

  if (data.type === 'IMAGE' && !data.mediaUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'mediaUrl is required for IMAGE content.',
      path: ['mediaUrl'],
    });
  }

  if (data.type === 'LINK' && !data.body.startsWith('http')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'body must be a valid URL for LINK content.',
      path: ['body'],
    });
  }
});
