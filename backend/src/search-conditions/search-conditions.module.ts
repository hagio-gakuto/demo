import { Module } from '@nestjs/common';
import { SearchConditionsService } from './search-conditions.service';
import { SearchConditionsController } from './search-conditions.controller';

@Module({
  controllers: [SearchConditionsController],
  providers: [SearchConditionsService],
})
export class SearchConditionsModule {}
