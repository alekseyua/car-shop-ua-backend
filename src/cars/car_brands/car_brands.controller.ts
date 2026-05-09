import { Controller, Get,Query } from '@nestjs/common';
import { CarBrandsService } from './car_brands.service';
import { PaginationDto } from 'src/shared/common/pagination/dto/pagination-query-dto';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';

@Controller('car-brands')
export class CarBrandsController {
  constructor(private readonly carBrandsService: CarBrandsService) { }

  /**
   * Получить список брендов автомобилей
   */
  @ApiOperation({
    summary: 'Список брендов автомобилей',
    description: 'Возвращает список брендов автомобилей с поддержкой пагинации',
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    example: 1,
    required: false,
    description: 'Номер страницы'
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
    example: '10',
    description: 'Количество элементов на странице'
  })
  @ApiOkResponse({
    description: 'Список брендов успешно получен'
  })
  @Get()
  findAll(@Query() dto: PaginationDto) {

    return this.carBrandsService.findAll(dto);
  }

}
