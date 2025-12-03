import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SearchConditionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.searchCondition.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
