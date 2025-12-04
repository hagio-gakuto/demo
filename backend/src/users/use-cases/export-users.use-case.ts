import { Injectable } from '@nestjs/common';
import type { Gender, UserRole } from '@prisma/client';
import { UsersRepository } from '../infrastructure/users.repository';
import type { UserResponseDto } from '../dto/user-response.dto';

type ExportUsersParams = {
  id?: string;
  search?: string;
  role?: UserRole;
  gender?: Gender | null;
};

@Injectable()
export class ExportUsersUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(params: ExportUsersParams): Promise<UserResponseDto[]> {
    // ページネーションなしで全件取得（pageとpageSizeは設定しない）
    // undefinedのプロパティを除外してfilterを作成
    const filter: {
      id?: string;
      search?: string;
      role?: UserRole;
      gender?: Gender | null;
    } = {};
    if (params.id) filter.id = params.id;
    if (params.search) filter.search = params.search;
    if (params.role !== undefined) filter.role = params.role;
    if (params.gender !== undefined) filter.gender = params.gender;

    // 検索条件がない場合はundefinedを渡す（全件取得）
    const hasFilter = Object.keys(filter).length > 0;
    const entities = await this.usersRepository.findAll(
      hasFilter ? filter : undefined,
    );
    return entities.map((user) => user.toPrimitives());
  }
}
