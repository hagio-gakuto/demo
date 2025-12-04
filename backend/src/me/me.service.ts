import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomLoggerService } from '../config/custom-logger.service';
import type { MeResponseDto } from './dto/me-response.dto';
import { PrismaUserMapper } from '../users/infrastructure/persistence/prisma-user.mapper';
import { NotFoundError } from '../common/errors/not-found.error';
import { handlePrismaError } from '../common/utils/prisma-error-handler';

@Injectable()
export class MeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CustomLoggerService,
  ) {}

  async getMe(userId: string): Promise<MeResponseDto> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundError('ユーザー', userId);
      }

      const entity = PrismaUserMapper.toEntity(user);
      return entity.toPrimitives();
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error : new Error(String(error)),
        undefined,
        'MeService',
      );
      handlePrismaError(error, {
        resourceName: 'ユーザー',
        id: userId,
      });
      throw error;
    }
  }
}
