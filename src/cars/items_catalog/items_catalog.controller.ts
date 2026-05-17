import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ItemsCatalogService } from './items_catalog.service';
import { CreateItemsCatalogDto } from './dto/create-items_catalog.dto';
import { UpdateItemsCatalogDto } from './dto/update-items_catalog.dto';
import { QueryItemsCatalogDto } from './dto/query-items_catalog.dto';
import { ProductDetailResponse, ResponseItemCatalogDto } from './dto/response-items_catalog.dto';
import { ApiResponseProperty } from '@nestjs/swagger';

@Controller('items-catalog')
export class ItemsCatalogController {
  constructor(private readonly itemsCatalogService: ItemsCatalogService) {}

  @Get()
  findAll(@Query() dto: QueryItemsCatalogDto): Promise<ResponseItemCatalogDto[]> {
    return this.itemsCatalogService.findAll(dto);
  }

  @ApiResponseProperty({
    type: ProductDetailResponse,
  })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<ProductDetailResponse> {
    return this.itemsCatalogService.findOne(id);
  }

}
