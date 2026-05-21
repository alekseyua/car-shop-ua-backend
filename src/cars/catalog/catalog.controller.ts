import { Controller, Get, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { QueryCatalogDto } from './dto/query-catalog.dto';
import { PaginationResponse } from 'src/shared/common/pagination/dto/paginated-response.dto';
import { ResponseCatalogCarDto } from './dto/response-catalog.dto';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { MetaDto } from 'src/shared/common/pagination/dto/meta.dto';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @ApiExtraModels(ResponseCatalogCarDto)
  @ApiExtraModels(MetaDto)
  @ApiOkResponse({
    description: 'Список автомобилей в каталоге успешно получен',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(ResponseCatalogCarDto)
          }
        },
        meta: {
          $ref: getSchemaPath(MetaDto)
        }
      }
    }
  })
  @Get()
    findAll(@Query() dto: QueryCatalogDto):Promise<PaginationResponse<ResponseCatalogCarDto>> {

    return this.catalogService.findAll(dto);
  }
}
