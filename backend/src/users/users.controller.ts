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
import { UsersService } from './users.service';
import {
  createUserRequestSchema,
  type CreateUserRequestDto,
} from './dto/create-user.dto';
import {
  type UpdateUserRequestDto,
  updateUserRequestSchema,
} from './dto/update-user.dto';
import type { UserResponseDto } from './dto/user-response.dto';
import {
  type SearchUserRequestDto,
  searchUserRequestSchema,
} from './dto/search-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Get('search/detail')
  async search(
    @Query(new ZodValidationPipe(searchUserRequestSchema))
    query: SearchUserRequestDto,
  ): Promise<UserResponseDto[]> {
    return this.usersService.search({
      email: query.email,
      role: query.role as UserRole | undefined,
      firstName: query.firstName,
      lastName: query.lastName,
      gender: (query.gender ?? null) as Gender | null,
    });
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(createUserRequestSchema))
    dto: CreateUserRequestDto,
  ): Promise<UserResponseDto> {
    return this.usersService.create({
      email: dto.email,
      role: dto.role as UserRole,
      firstName: dto.firstName,
      lastName: dto.lastName,
      gender: (dto.gender ?? null) as Gender | null,
    });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateUserRequestSchema))
    dto: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update({
      id,
      email: dto.email,
      role: dto.role as UserRole,
      firstName: dto.firstName,
      lastName: dto.lastName,
      gender: (dto.gender ?? null) as Gender | null,
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.delete(id);
  }
}
