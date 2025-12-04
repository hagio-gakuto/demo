import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const updateSearchConditionRequestSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
});

export class UpdateSearchConditionRequestDto {
  @ApiProperty({
    description: '検索条件名',
    example: '管理者ユーザー',
    required: true,
  })
  name: string;
}
