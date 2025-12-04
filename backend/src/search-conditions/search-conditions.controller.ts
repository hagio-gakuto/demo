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
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { FindAllSearchConditionsUseCase } from './use-cases/find-all-search-conditions.use-case';
import { CreateSearchConditionUseCase } from './use-cases/create-search-condition.use-case';
import { UpdateSearchConditionUseCase } from './use-cases/update-search-condition.use-case';
import { DeleteSearchConditionUseCase } from './use-cases/delete-search-condition.use-case';
import {
  createSearchConditionRequestSchema,
  type CreateSearchConditionRequestDto,
} from './dto/create-search-condition.dto';
import {
  updateSearchConditionRequestSchema,
  type UpdateSearchConditionRequestDto,
} from './dto/update-search-condition.dto';
import { SearchConditionResponseDto } from './dto/search-condition-response.dto';

@Controller('search-conditions')
export class SearchConditionsController {
  constructor(
    private readonly findAllSearchConditionsUseCase: FindAllSearchConditionsUseCase,
    private readonly createSearchConditionUseCase: CreateSearchConditionUseCase,
    private readonly updateSearchConditionUseCase: UpdateSearchConditionUseCase,
    private readonly deleteSearchConditionUseCase: DeleteSearchConditionUseCase,
  ) {}

  @Get()
  async findAll(
    @Query('formType') formType?: string,
  ): Promise<SearchConditionResponseDto[]> {
    return this.findAllSearchConditionsUseCase.execute({ formType });
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(createSearchConditionRequestSchema))
    dto: CreateSearchConditionRequestDto,
  ): Promise<SearchConditionResponseDto> {
    const systemUserId = 'system';
    return this.createSearchConditionUseCase.execute({
      formType: dto.formType,
      name: dto.name,
      urlParams: dto.urlParams,
      userId: systemUserId,
    });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateSearchConditionRequestSchema))
    dto: UpdateSearchConditionRequestDto,
  ): Promise<SearchConditionResponseDto> {
    const systemUserId = 'system';
    return this.updateSearchConditionUseCase.execute({
      id,
      name: dto.name,
      userId: systemUserId,
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    const systemUserId = 'system';
    return this.deleteSearchConditionUseCase.execute({
      id,
      userId: systemUserId,
    });
  }
}
