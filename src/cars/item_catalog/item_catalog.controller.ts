import { Controller, Get, Param, Query } from '@nestjs/common';
import { ItemCatalogService } from './item_catalog.service';
import { QueryItemsCatalogDto } from './dto/query-items_catalog.dto';
import {
  ResponseProductDetailDto,
  ResponseItemCatalogDto,
} from './dto/response-items_catalog.dto';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller()
export class ItemsCatalogController {
  constructor(private readonly ItemCatalogService: ItemCatalogService) {}

  @ApiOkResponse({
    type: [ResponseItemCatalogDto],
    description: 'Список товаров успешно получен',
  })
  @Get('items-catalog')
  findAll(
    @Query() dto: QueryItemsCatalogDto,
  ): Promise<ResponseItemCatalogDto[]> {
    return this.ItemCatalogService.findAll(dto);
  }

  @ApiOkResponse({
    type: ResponseProductDetailDto,
  })
  @Get('product/:id')
  findOne(@Param('id') id: string): Promise<ResponseProductDetailDto> {
    return this.ItemCatalogService.findOne(id);
  }
}
