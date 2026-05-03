import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CarModelsService } from './car_models.service';
import { CreateCarModelDto } from './dto/create-car_model.dto';
import { UpdateCarModelDto } from './dto/update-car_model.dto';

@Controller('car-models')
export class CarModelsController {
  constructor(private readonly carModelsService: CarModelsService) {}

  @Post()
  create(@Body() createCarModelDto: CreateCarModelDto) {
    return this.carModelsService.create(createCarModelDto);
  }

  @Get()
  findAll() {
    return this.carModelsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carModelsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCarModelDto: UpdateCarModelDto) {
    return this.carModelsService.update(+id, updateCarModelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carModelsService.remove(+id);
  }
}
