import { Injectable } from '@nestjs/common';
import type { Gender, UserRole } from '@prisma/client';
import { UsersRepository } from './users.repository';
import { UserEntity } from './entities/user.entity';
import type { UserResponseDto } from './dto/user-response.dto';
import { NotFoundError } from '../common/errors/not-found.error';
import { getCurrentDate } from '../common/utils/date.utils';

type CreateUserParams = {
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  gender: Gender | null;
};

type UpdateUserParams = {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  gender: Gender | null;
};

type SearchUserParams = {
  email?: string;
  role?: UserRole;
  firstName?: string;
  lastName?: string;
  gender?: Gender | null;
};

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.findAll();
    return users.map((u) => u.toPrimitives());
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user || user.deletedAt) {
      throw new NotFoundError('ユーザー', id);
    }
    return user.toPrimitives();
  }

  async create(params: CreateUserParams): Promise<UserResponseDto> {
    const systemUserId = 'system';
    const entity = UserEntity.createNew({
      email: params.email,
      role: params.role,
      firstName: params.firstName,
      lastName: params.lastName,
      gender: params.gender,
      userId: systemUserId,
    });
    const created = await this.usersRepository.create(entity);
    return created.toPrimitives();
  }

  async update(params: UpdateUserParams): Promise<UserResponseDto> {
    const systemUserId = 'system';
    const existing = await this.usersRepository.findById(params.id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundError('ユーザー', params.id);
    }

    existing.changeEmail(params.email, systemUserId);
    existing.changeRole(params.role, systemUserId);
    existing.changeName(params.firstName, params.lastName, systemUserId);
    existing.changeGender(params.gender, systemUserId);

    const updated = await this.usersRepository.update(existing);
    return updated.toPrimitives();
  }

  async delete(id: string): Promise<UserResponseDto> {
    const systemUserId = 'system';
    const existing = await this.usersRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundError('ユーザー', id);
    }

    existing.delete(systemUserId, getCurrentDate());
    const deleted = await this.usersRepository.update(existing);
    return deleted.toPrimitives();
  }

  async search(params: SearchUserParams): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.findAll({
      email: params.email,
      role: params.role,
      firstName: params.firstName,
      lastName: params.lastName,
      gender: params.gender,
    });
    return users.map((user) => user.toPrimitives());
  }
}
