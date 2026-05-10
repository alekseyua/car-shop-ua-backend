import { Controller, Get, Query } from '@nestjs/common';
import { CarModelsService } from './car_models.service';
import { ApiExtraModels, ApiOkResponse, ApiOperation, ApiQuery, getSchemaPath } from '@nestjs/swagger';
import { QueryCarModelDto } from './dto/query-car_model.dt';
import { MetaDto } from 'src/shared/common/pagination/dto/meta.dto';
import { ResponseCarModelDto } from './dto/response-car_model.dto';

@Controller('car-models')
export class CarModelsController {
  constructor(private readonly carModelsService: CarModelsService) { }

  @ApiOperation({
    summary: 'Получить список моделей автомобилей',
    description: 'Возвращает все доступные модели автомобилей',
  })

  @ApiExtraModels(ResponseCarModelDto)
  @ApiExtraModels(MetaDto)
  @ApiOkResponse({
    description: 'список модификаций автомобиля по ID модели успешно получен',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(ResponseCarModelDto)
          }
        },
        meta: {
          $ref: getSchemaPath(MetaDto)
        }
      }
    }
  })
  @Get()
  findAll(@Query() dto: QueryCarModelDto) {
    return this.carModelsService.findAll(dto);
  }

}
