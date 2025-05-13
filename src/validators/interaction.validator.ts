import { z } from 'zod';

export const InteractionSchema = z.object({
  type: z.enum(['VIEW', 'CLICK', 'LIKE', 'COMMENT', 'SHARE']),
  contentId: z.string().cuid(),
  payload: z.string().optional(),
}).superRefine((data, ctx) => {
  if (['COMMENT', 'SHARE'].includes(data.type) && !data.payload) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${data.type} requires a payload.`,
      path: ['payload'],
    });
  }

  if (!['COMMENT', 'SHARE'].includes(data.type) && data.payload) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${data.type} should not include a payload.`,
      path: ['payload'],
    });
  }
});

export const DeleteInteractionSchema = z.object({
  type: z.enum(['LIKE', 'SHARE', 'COMMENT']),
  contentId: z.string().cuid(),
});
