import { Controller, Get } from '@nestjs/common';
import { MeService } from './me.service';
import type { MeResponseDto } from './dto/me-response.dto';

@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  getMe(): MeResponseDto {
    return this.meService.getMe();
  }
}
