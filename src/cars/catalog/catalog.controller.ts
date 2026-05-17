import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { QueryCatalogDto } from './dto/query-catalog.dto';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
    findAll(@Query() dto: QueryCatalogDto) {

    return this.catalogService.findAll(dto);
  }

}
