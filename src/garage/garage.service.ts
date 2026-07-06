import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateGarageDto } from './dto/create-garage.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class GarageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateGarageDto) {
    const garage = await this.prisma.garage.findFirst({
      where: {
        userId,
      },
    });

    if (garage) {
      throw new BadRequestException('Garage already exists');
    }

    return this.prisma.garage.create({
      data: {
        userId,
        name: dto.name,
        comment: dto.comment,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.garage.findMany({
      where: {
        userId,
      },
    });
  }

  async remove(id: number, userId: number) {
    return this.prisma.garage.delete({
      where: {
        id,
        userId,
      },
    });
  }
}
