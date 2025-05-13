import { z } from 'zod';

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  role: z.enum(['MEMBER', 'BUSINESS']),
  businessName: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === 'BUSINESS' && !data.businessName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Business name is required for business accounts.',
      path: ['businessName'],
    });
  }
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type SignupSchemaType = z.infer<typeof SignupSchema>;
export type LoginSchemaType = z.infer<typeof LoginSchema>;