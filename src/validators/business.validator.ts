import { z } from 'zod';

export const UpdateBusinessSchema = z.object({
  name: z.string().optional(),
  logo: z.string().url().optional(),
}).refine(data => data.name || data.logo, {
  message: 'At least one field (name or logo) must be provided.',
});
