import { Controller, Get, Query } from '@nestjs/common';
import { ModificationService } from './modification.service';
import { QueryCarModificationDto } from './dto/query-car_modfication.dto';
import { ApiExtraModels, ApiOkResponse, ApiOperation, ApiQuery, getSchemaPath } from '@nestjs/swagger';
import { ResponseCarModificationDto } from './dto/response-car_modification.dto';
import { MetaDto } from 'src/shared/common/pagination/dto/meta.dto';
import { ParserService } from 'src/integrations/parser/parser.service';

@Controller('car-modification')
export class ModificationController {
  constructor(
    private readonly ModificationService: ModificationService,
    private readonly parserService: ParserService,
  ) {}

  @ApiOperation({
    summary: 'Получить список модификаций автомобиля',
    description:
      'Возвращает список модификаций автомобиля по ID модели с поддержкой пагинации',
  })

  @ApiQuery({
    name: 'modelId',
    type: 'number',
    required: true,
    example: '1',
    description: 'ID модели автомобиля',
  })
  
  @ApiExtraModels(ResponseCarModificationDto)
  @ApiExtraModels(MetaDto)
  @ApiOkResponse({
    description: 'список модификаций автомобиля по ID модели успешно получен',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(ResponseCarModificationDto)
          }
        },
        meta: {
          $ref: getSchemaPath(MetaDto)
        }
      }
    }
  })

  @Get()
  findAll(@Query() dto: QueryCarModificationDto) {
    this.parserService.getCatalog(28435);
    return this.ModificationService.findAll(dto);
  }
}