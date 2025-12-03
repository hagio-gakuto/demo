import { Injectable } from '@nestjs/common';
import type { MeResponseDto } from './dto/me-response.dto';

@Injectable()
export class MeService {
  async getMe(): Promise<MeResponseDto> {
    // 固定のユーザー情報を返す（簡易な権限チェック用）
    return {
      id: 'admin',
      name: '管理者ユーザー',
      email: 'admin@example.com',
      role: 'admin',
    };
  }
}


