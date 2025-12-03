import { z } from 'zod';
import { USER_ROLES, GENDERS } from '../../common/enums';

export const createUserRequestSchema = z.object({
  email: z.string().email('メールアドレスの形式が正しくありません'),
  role: z.enum(USER_ROLES, {
    errorMap: () => ({ message: '権限は必須です' }),
  }),
  firstName: z.string().min(1, '名は必須です'),
  lastName: z.string().min(1, '姓は必須です'),
  gender: z.enum(GENDERS).nullable().optional(),
});

export type CreateUserRequestDto = z.infer<typeof createUserRequestSchema>;
