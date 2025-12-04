import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import type { UserResponseDto } from '../dto/user-response.dto';
import { NotFoundError } from '../../common/errors/not-found.error';
import { getCurrentDate } from '../../common/utils/date.utils';

@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(id: string): Promise<UserResponseDto> {
    const systemUserId = 'system';
    const existing = await this.usersRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundError('ユーザー', id);
    }

    existing.delete(systemUserId, getCurrentDate());
    const deleted = await this.usersRepository.update(existing);
    return deleted.toPrimitives();
  }
}
