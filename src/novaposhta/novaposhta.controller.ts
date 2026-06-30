import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { NovaposhtaService } from './novaposhta.service';
import { CreateNovaposhtaDto } from './dto/create-novaposhta.dto';
import { UpdateNovaposhtaDto } from './dto/update-novaposhta.dto';
import { QueryCitiesDto } from './dto/query-novaposhta.dto';

@Controller('novaposhta')
export class NovaposhtaController {
  constructor(private readonly novaposhtaService: NovaposhtaService) {}

  @Get('get-areas')
  findAll() {
    const data = this.novaposhtaService.findRegion();
    return data;
  }

  @Get('get-sity')
  findSity(
    @Query() dto: QueryCitiesDto
  ){
    const res = this.novaposhtaService.findSity(dto);
    return res;
  }

}
