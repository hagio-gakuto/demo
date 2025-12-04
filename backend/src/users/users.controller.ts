import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import type { Gender, UserRole } from '@prisma/client';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FindAllUsersUseCase } from './use-cases/find-all-users.use-case';
import { FindUserUseCase } from './use-cases/find-user.use-case';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { UpdateUserUseCase } from './use-cases/update-user.use-case';
import { DeleteUserUseCase } from './use-cases/delete-user.use-case';
import { SearchUsersUseCase } from './use-cases/search-users.use-case';
import { ExportUsersUseCase } from './use-cases/export-users.use-case';
import {
  createUserRequestSchema,
  type CreateUserRequestDto,
} from './dto/create-user-request.dto';
import {
  type UpdateUserRequestDto,
  updateUserRequestSchema,
} from './dto/update-user-request.dto';
import type { UserResponseDto } from './dto/user-response.dto';
import type { UserListResponseDto } from './dto/user-list-response.dto';
import {
  type SearchUserRequestDto,
  searchUserRequestSchema,
} from './dto/search-user-request.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    private readonly findUserUseCase: FindUserUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly searchUsersUseCase: SearchUsersUseCase,
    private readonly exportUsersUseCase: ExportUsersUseCase,
  ) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<UserListResponseDto> {
    return this.findAllUsersUseCase.execute({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }

  @Get('search/detail')
  async search(
    @Query(new ZodValidationPipe(searchUserRequestSchema))
    query: SearchUserRequestDto,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<UserListResponseDto> {
    return this.searchUsersUseCase.execute({
      id: query.id ?? undefined,
      search: query.search ?? undefined,
      role: query.role as UserRole | undefined,
      gender: query.gender as Gender | null | undefined,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }

  @Get('export')
  async export(
    @Query(new ZodValidationPipe(searchUserRequestSchema))
    query: SearchUserRequestDto,
  ): Promise<UserResponseDto[]> {
    return this.exportUsersUseCase.execute({
      id: query.id ?? undefined,
      search: query.search ?? undefined,
      role: query.role as UserRole | undefined,
      gender: query.gender as Gender | null | undefined,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.findUserUseCase.execute(id);
  }

  @Post()
  async create(
    @CurrentUser() userId: string,
    @Body(new ZodValidationPipe(createUserRequestSchema))
    dto: CreateUserRequestDto,
  ): Promise<UserResponseDto> {
    return this.createUserUseCase.execute({
      email: dto.email,
      role: dto.role as UserRole,
      firstName: dto.firstName,
      lastName: dto.lastName,
      gender: (dto.gender ?? null) as Gender | null,
      userId,
    });
  }

  @Put(':id')
  async update(
    @CurrentUser() userId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateUserRequestSchema))
    dto: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    return this.updateUserUseCase.execute({
      id,
      email: dto.email,
      role: dto.role as UserRole,
      firstName: dto.firstName,
      lastName: dto.lastName,
      gender: (dto.gender ?? null) as Gender | null,
      userId,
    });
  }

  @Delete(':id')
  async delete(
    @CurrentUser() userId: string,
    @Param('id') id: string,
  ): Promise<UserResponseDto> {
    return this.deleteUserUseCase.execute(id, userId);
  }
}
