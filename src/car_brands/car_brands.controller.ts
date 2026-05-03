import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CarBrandsService } from './car_brands.service';
import { CreateCarBrandDto } from './dto/create-car_brand.dto';
import { UpdateCarBrandDto } from './dto/update-car_brand.dto';

@Controller('car-brands')
export class CarBrandsController {
  constructor(private readonly carBrandsService: CarBrandsService) {}

  @Post()
  create(@Body() createCarBrandDto: CreateCarBrandDto) {
    return this.carBrandsService.create(createCarBrandDto);
  }

  @Get()
  findAll() {
    return this.carBrandsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carBrandsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCarBrandDto: UpdateCarBrandDto) {
    return this.carBrandsService.update(+id, updateCarBrandDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carBrandsService.remove(+id);
  }
}
