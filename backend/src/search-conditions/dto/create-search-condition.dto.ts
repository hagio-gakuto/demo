import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const createSearchConditionRequestSchema = z.object({
  formType: z.string().min(1, 'フォームタイプは必須です'),
  name: z.string().min(1, '名前は必須です'),
  urlParams: z.string(),
});

export class CreateSearchConditionRequestDto {
  @ApiProperty({
    description: 'フォームタイプ',
    example: 'user-management',
    required: true,
  })
  formType: string;

  @ApiProperty({
    description: '検索条件名',
    example: '管理者ユーザー',
    required: true,
  })
  name: string;

  @ApiProperty({
    description: 'URLパラメータ',
    example: 'role=admin&page=1',
    required: true,
  })
  urlParams: string;
}
