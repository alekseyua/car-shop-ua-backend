import { Injectable } from '@nestjs/common';
import { CreateCarModelDto } from './dto/create-car_model.dto';
import { UpdateCarModelDto } from './dto/update-car_model.dto';
// import { PrismaService } from '../prisma.service'
@Injectable()
export class CarModelsService {
  create(createCarModelDto: CreateCarModelDto) {
    return 'This action adds a new carModel';
  }

  findAll() {
    return `This action returns all carModels`;
  }

  findOne(id: number) {
    return `This action returns a #${id} carModel`;
  }

  update(id: number, updateCarModelDto: UpdateCarModelDto) {
    return `This action updates a #${id} carModel`;
  }

  remove(id: number) {
    return `This action removes a #${id} carModel`;
  }
}
