import { Injectable } from '@nestjs/common';
import type { Prisma, User, UserRole, Gender } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { UserEntity } from './entities/user.entity';
import { UserEmail } from './value-objects/user-email.vo';
import { UserName } from './value-objects/user-name.vo';

export type UsersFindManyFilter = {
  includeDeleted?: boolean;
  email?: string;
  role?: UserRole;
  firstName?: string;
  lastName?: string;
  gender?: Gender | null;
};

export interface IUsersRepository {
  findAll(filter?: UsersFindManyFilter): Promise<UserEntity[]>;
  findById(id: string): Promise<UserEntity | null>;
  create(user: UserEntity): Promise<UserEntity>;
  update(user: UserEntity): Promise<UserEntity>;
}

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter?: UsersFindManyFilter): Promise<UserEntity[]> {
    const includeDeleted = filter?.includeDeleted ?? false;

    const where: Prisma.UserWhereInput = {};
    if (!includeDeleted) {
      where.deletedAt = null;
    }
    if (filter?.email) {
      where.email = filter.email;
    }
    if (filter?.role) {
      where.role = filter.role;
    }
    if (filter?.firstName) {
      where.firstName = filter.firstName;
    }
    if (filter?.lastName) {
      where.lastName = filter.lastName;
    }
    if (typeof filter?.gender !== 'undefined') {
      where.gender = filter.gender;
    }

    const rows = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) => this.toEntity(row));
  }

  async findById(id: string): Promise<UserEntity | null> {
    const row = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!row) return null;
    return this.toEntity(row);
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const primitives = user.toPrimitives();
    const created = await this.prisma.user.create({
      data: {
        email: primitives.email,
        role: primitives.role,
        firstName: primitives.firstName,
        lastName: primitives.lastName,
        gender: primitives.gender,
        createdBy: primitives.createdBy,
        updatedBy: primitives.updatedBy,
        deletedAt: primitives.deletedAt ?? null,
        deletedBy: primitives.deletedBy ?? null,
      },
    });
    return this.toEntity(created);
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const primitives = user.toPrimitives();
    if (!primitives.id) {
      throw new Error('ユーザーIDは必須です');
    }
    const updated = await this.prisma.user.update({
      where: { id: primitives.id },
      data: {
        email: primitives.email,
        role: primitives.role,
        firstName: primitives.firstName,
        lastName: primitives.lastName,
        gender: primitives.gender,
        updatedBy: primitives.updatedBy,
        deletedAt: primitives.deletedAt ?? null,
        deletedBy: primitives.deletedBy ?? null,
      },
    });
    return this.toEntity(updated);
  }

  private toEntity(row: User): UserEntity {
    return UserEntity.reconstruct({
      id: row.id,
      email: UserEmail.create(row.email),
      role: row.role,
      name: UserName.create({
        firstName: row.firstName,
        lastName: row.lastName,
      }),
      gender: row.gender,
      createdAt: row.createdAt,
      createdBy: row.createdBy,
      updatedAt: row.updatedAt,
      updatedBy: row.updatedBy,
      deletedAt: row.deletedAt,
      deletedBy: row.deletedBy,
    });
  }
}


