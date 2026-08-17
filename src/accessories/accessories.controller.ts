import { Controller, Get, Query } from '@nestjs/common';
import { AccessoriesService } from './accessories.service';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import {
  QueryCatalogAccessoriesDto,
  ResponseProductAccessoriesDto,
} from './dto/response.accessories.dto';
import { MetaDto } from 'src/shared/common/pagination/dto/meta.dto';
import { PaginationResponse } from 'src/shared/common/pagination/dto/paginated-response.dto';

@Controller('accessories')
export class AccessoriesController {
  constructor(private readonly accessoriesService: AccessoriesService) {}

  @Get('menu')
  async getMenuAccessories() {
    return this.accessoriesService.getMenuAccessories();
  }

  @Get('catalog')
  @ApiExtraModels(ResponseProductAccessoriesDto)
  @ApiExtraModels(MetaDto)
  @ApiOkResponse({
    description: 'Получить каталог аксессуаров',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(ResponseProductAccessoriesDto),
          },
        },
        meta: {
          $ref: getSchemaPath(MetaDto),
        },
      },
    },
  })
  async getCatalogAccessories(
    @Query() dto: QueryCatalogAccessoriesDto,
  ): Promise<PaginationResponse<ResponseProductAccessoriesDto>> {
    return await this.accessoriesService.getCatalogAccessories(dto);
  }
}
