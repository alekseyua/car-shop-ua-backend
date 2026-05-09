import { Injectable } from '@nestjs/common';
import { CreateCarModificationDto } from './dto/create-car_modification.dto';
import { UpdateCarModificationDto } from './dto/update-car_modification.dto';

@Injectable()
export class CarModificationService {
  create(createCarModificationDto: CreateCarModificationDto) {
    return 'This action adds a new carModification';
  }

  findAll() {
    return `This action returns all carModification`;
  }

  findOne(id: number) {
    return `This action returns a #${id} carModification`;
  }

  update(id: number, updateCarModificationDto: UpdateCarModificationDto) {
    return `This action updates a #${id} carModification`;
  }

  remove(id: number) {
    return `This action removes a #${id} carModification`;
  }
}
