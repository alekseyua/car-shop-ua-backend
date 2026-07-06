import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GarageCarService } from './garage-car.service';
import { CreateGarageCarDto } from './dto/create-garage-car.dto';
import { UpdateGarageCarDto } from './dto/update-garage-car.dto';

@Controller('garage-car')
export class GarageCarController {
  constructor(private readonly garageCarService: GarageCarService) {}

  @Post()
  create(@Body() createGarageCarDto: CreateGarageCarDto) {
    return this.garageCarService.create(createGarageCarDto);
  }

  @Get()
  findAll() {
    return this.garageCarService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.garageCarService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGarageCarDto: UpdateGarageCarDto,
  ) {
    return this.garageCarService.update(+id, updateGarageCarDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.garageCarService.remove(+id);
  }
}
