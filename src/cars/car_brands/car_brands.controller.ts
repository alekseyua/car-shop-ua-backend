import { Controller, Get, Query } from '@nestjs/common';
import { CarBrandsService } from './car_brands.service';
import { PaginationDto } from 'src/shared/common/pagination/dto/pagination-query-dto';
import { ApiExtraModels, ApiOkResponse, ApiOperation, ApiQuery, getSchemaPath } from '@nestjs/swagger';
import { MetaDto } from 'src/shared/common/pagination/dto/meta.dto';
import { ResponseCarBrandDto } from './dto/response-car_brand.dto';

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

  @ApiExtraModels(ResponseCarBrandDto)
  @ApiExtraModels(MetaDto)
  @ApiOkResponse({
    description: 'список модификаций автомобиля по ID модели успешно получен',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(ResponseCarBrandDto)
          }
        },
        meta: {
          $ref: getSchemaPath(MetaDto)
        }
      }
    }
  })
  @Get()
  findAll(@Query() dto: PaginationDto) {

    return this.carBrandsService.findAll(dto);
  }

}
