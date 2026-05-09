import { Controller, Get, Query } from '@nestjs/common';
import { CarModelsService } from './car_models.service';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { QueryCarModelDto } from './dto/query-car_model.dt';

@Controller('car-models')
export class CarModelsController {
  constructor(private readonly carModelsService: CarModelsService) {}

  @ApiOperation({
    summary: 'Получить список моделей автомобилей',
    description: 'Возвращает все доступные модели автомобилей',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Номер страницы',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Количество элементов на странице',
  })

  @ApiOkResponse({
    description: 'Список моделей успешно получен',
  })
  @Get()
  findAll(@Query() dto: QueryCarModelDto) {
    return this.carModelsService.findAll(dto);
  }

}
