import { z } from 'zod';

export const CreateMembershipSchema = z.object({
  businessId: z.string().cuid(),
});
