import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ItemsCatalogService } from './items_catalog.service';
import { CreateItemsCatalogDto } from './dto/create-items_catalog.dto';
import { UpdateItemsCatalogDto } from './dto/update-items_catalog.dto';
import { QueryItemsCatalogDto } from './dto/query-items_catalog.dto';

@Controller('items-catalog')
export class ItemsCatalogController {
  constructor(private readonly itemsCatalogService: ItemsCatalogService) {}

  @Post()
  create(@Body() createItemsCatalogDto: CreateItemsCatalogDto) {
    return this.itemsCatalogService.create(createItemsCatalogDto);
  }


  @Get()
  findAll(@Query() dto: QueryItemsCatalogDto) {
    return this.itemsCatalogService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemsCatalogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateItemsCatalogDto: UpdateItemsCatalogDto) {
    return this.itemsCatalogService.update(+id, updateItemsCatalogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemsCatalogService.remove(+id);
  }
}
