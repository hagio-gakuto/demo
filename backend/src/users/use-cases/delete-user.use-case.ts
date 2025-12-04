import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import type { UserResponseDto } from '../dto/user-response.dto';
import { NotFoundError } from '../../common/errors/not-found.error';
import { getCurrentDate } from '../../common/utils/date.utils';

@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(id: string, userId: string): Promise<UserResponseDto> {
    const existing = await this.usersRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundError('ユーザー', id);
    }

    existing.delete(userId, getCurrentDate());
    const deleted = await this.usersRepository.update(existing);
    return deleted.toPrimitives();
  }
}
