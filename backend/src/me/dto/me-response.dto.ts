import type { UserRole } from '@prisma/client';

export type MeResponseDto = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};


