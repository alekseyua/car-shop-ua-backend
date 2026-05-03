import { Injectable } from '@nestjs/common';
import { CreateCarBrandDto } from './dto/create-car_brand.dto';
import { UpdateCarBrandDto } from './dto/update-car_brand.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CarBrandsService {
  constructor (private prisma: PrismaService){}

  create(createCarBrandDto: CreateCarBrandDto) {
    return 'This action adds a new carBrand';
  }

  findAll() {
    // console.log({prisma: this.prisma})
    return `This action returns all carBrands`;
  }

  findOne(id: number) {
    return `This action returns a #${id} carBrand`;
  }

  update(id: number, updateCarBrandDto: UpdateCarBrandDto) {
    return `This action updates a #${id} carBrand`;
  }

  remove(id: number) {
    return `This action removes a #${id} carBrand`;
  }
}
