import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NovaposhtaService } from './novaposhta.service';
import { CreateNovaposhtaDto } from './dto/create-novaposhta.dto';
import { UpdateNovaposhtaDto } from './dto/update-novaposhta.dto';

@Controller('novaposhta')
export class NovaposhtaController {
  constructor(private readonly novaposhtaService: NovaposhtaService) {}

  @Get('getAreas')
  findAll() {
    const data = this.novaposhtaService.findAll();
    return data;
  }

}
