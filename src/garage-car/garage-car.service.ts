import { Injectable } from '@nestjs/common';
import { CreateGarageCarDto } from './dto/create-garage-car.dto';
import { UpdateGarageCarDto } from './dto/update-garage-car.dto';

@Injectable()
export class GarageCarService {
  create(createGarageCarDto: CreateGarageCarDto) {
    return 'This action adds a new garageCar';
  }

  findAll() {
    return `This action returns all garageCar`;
  }

  findOne(id: number) {
    return `This action returns a #${id} garageCar`;
  }

  update(id: number, updateGarageCarDto: UpdateGarageCarDto) {
    return `This action updates a #${id} garageCar`;
  }

  remove(id: number) {
    return `This action removes a #${id} garageCar`;
  }
}
