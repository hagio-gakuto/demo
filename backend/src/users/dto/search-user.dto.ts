import { z } from 'zod';
import { USER_ROLES, GENDERS } from '../../common/enums';

export const searchUserRequestSchema = z.object({
  email: z.string().email().optional(),
  role: z.enum(USER_ROLES).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  gender: z.enum(GENDERS).nullable().optional(),
});

export type SearchUserRequestDto = z.infer<typeof searchUserRequestSchema>;
