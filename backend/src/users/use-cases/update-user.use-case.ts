import { Injectable } from '@nestjs/common';
import type { Gender, UserRole } from '@prisma/client';
import { UsersRepository } from '../infrastructure/users.repository';
import type { UserResponseDto } from '../dto/user-response.dto';
import { NotFoundError } from '../../common/errors/not-found.error';
import { handlePrismaError } from '../../common/utils/prisma-error-handler';
import { CustomLoggerService } from '../../config/custom-logger.service';

type UpdateUserParams = {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  gender: Gender | null;
};

@Injectable()
export class UpdateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly logger: CustomLoggerService,
  ) {}

  async execute(params: UpdateUserParams): Promise<UserResponseDto> {
    const systemUserId = 'system';
    const existing = await this.usersRepository.findById(params.id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundError('ユーザー', params.id);
    }

    existing.changeEmail(params.email, systemUserId);
    existing.changeRole(params.role, systemUserId);
    existing.changeName(params.firstName, params.lastName, systemUserId);
    existing.changeGender(params.gender, systemUserId);

    try {
      const updated = await this.usersRepository.update(existing);
      return updated.toPrimitives();
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error : new Error(String(error)),
        undefined,
        'UpdateUserUseCase',
      );
      handlePrismaError(error, {
        resourceName: 'ユーザー',
        id: params.id,
        duplicateMessage: 'このメールアドレスは既に登録されています',
      });
      throw error;
    }
  }
}
