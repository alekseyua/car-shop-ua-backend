import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CarModificationService } from './car_modification.service';
import { CreateCarModificationDto } from './dto/create-car_modification.dto';
import { UpdateCarModificationDto } from './dto/update-car_modification.dto';

@Controller('car-modification')
export class CarModificationController {
  constructor(private readonly carModificationService: CarModificationService) {}

  @Post()
  create(@Body() createCarModificationDto: CreateCarModificationDto) {
    return this.carModificationService.create(createCarModificationDto);
  }

  @Get()
  findAll() {
    return this.carModificationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carModificationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCarModificationDto: UpdateCarModificationDto) {
    return this.carModificationService.update(+id, updateCarModificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carModificationService.remove(+id);
  }
}
