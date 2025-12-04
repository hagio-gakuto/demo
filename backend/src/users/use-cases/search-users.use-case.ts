import { Injectable } from '@nestjs/common';
import type { Gender, UserRole } from '@prisma/client';
import { UsersRepository } from '../infrastructure/users.repository';
import type { UserListResponseDto } from '../dto/user-list-response.dto';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../common/constants';

type SearchUsersParams = {
  id?: string;
  search?: string;
  role?: UserRole;
  gender?: Gender | null | undefined;
  page?: number;
  pageSize?: number;
};

@Injectable()
export class SearchUsersUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(params: SearchUsersParams): Promise<UserListResponseDto> {
    // undefinedのプロパティを除外してfilterを作成
    const filter: {
      id?: string;
      search?: string;
      role?: UserRole;
      gender?: Gender | null | undefined;
      page?: number;
      pageSize?: number;
    } = {};
    if (params.id) filter.id = params.id;
    if (params.search) filter.search = params.search;
    if (params.role !== undefined) filter.role = params.role;
    if (params.gender !== undefined) filter.gender = params.gender;
    if (params.page !== undefined) filter.page = params.page;
    if (params.pageSize !== undefined) filter.pageSize = params.pageSize;

    const [entities, total] = await Promise.all([
      this.usersRepository.findAll(filter),
      this.usersRepository.count(filter),
    ]);
    return {
      users: entities.map((user) => user.toPrimitives()),
      total,
      page: params.page ?? DEFAULT_PAGE,
      pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE,
    };
  }
}
