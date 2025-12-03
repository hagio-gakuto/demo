import { Controller, Get } from '@nestjs/common';
import { SearchConditionsService } from './search-conditions.service';

@Controller('search-conditions')
export class SearchConditionsController {
  constructor(
    private readonly searchConditionsService: SearchConditionsService,
  ) {}

  @Get()
  async findAll() {
    return this.searchConditionsService.findAll();
  }
}
