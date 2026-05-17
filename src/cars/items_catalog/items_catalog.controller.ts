import { Controller, Get, Param, Query } from '@nestjs/common';
import { ItemsCatalogService } from './items_catalog.service';
import { QueryItemsCatalogDto } from './dto/query-items_catalog.dto';
import { ProductDetailResponse, ResponseItemCatalogDto } from './dto/response-items_catalog.dto';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('items-catalog')
export class ItemsCatalogController {
  constructor(private readonly itemsCatalogService: ItemsCatalogService) {}

  @Get()
  findAll(@Query() dto: QueryItemsCatalogDto): Promise<ResponseItemCatalogDto[]> {
    return this.itemsCatalogService.findAll(dto);
  }

  @ApiOkResponse({
    type: ProductDetailResponse,
  })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<ProductDetailResponse> {
    return this.itemsCatalogService.findOne(id);
  }

}
