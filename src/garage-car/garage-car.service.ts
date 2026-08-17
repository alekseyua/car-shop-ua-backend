import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGarageCarDto } from './dto/create-garage-car.dto';
import { UpdateGarageCarDto } from './dto/update-garage-car.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class GarageCarService {
  constructor(private readonly prisma: PrismaService) {}

  private async getCarGarage(userId: number, id: number) {
    const car = await this.prisma.garageCar.findFirst({
      where: {
        id,
        garage: {
          userId,
        },
      },
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    return car;
  }

  private async getGarage(userId: number) {
    const garage = await this.prisma.garage.findFirst({
      where: {
        userId,
        isDefault: true,
      },
    });

    if (!garage) {
      console.log('Garage not found');
      return await this.prisma.garage.create({
        data: {
          name: 'My garage',
          userId: userId,
        },
      });
      // throw new NotFoundException('Garage not found');
    }

    return garage;
  }

  async create(userId: number, dto: CreateGarageCarDto) {
    const garage = await this.getGarage(userId);
    const garageId = dto?.garageId ?? garage?.id;
    // console.log({ garage, dto, garageId })
    // const carGarage = await this.getCarGarage(userId, garageId);
    if (!(garage || dto?.garageId)) {
      throw new NotFoundException('Garage and Garage-Car not found');
    }

    const modification = await this.prisma.modification.findUnique({
      where: {
        id: dto.modificationId,
      },
    });

    if (!modification) {
      throw new NotFoundException('Modification not found');
    }
    console.log('CREATE');
    return this.prisma.garageCar.create({
      data: {
        garageId: garageId,
        modificationId: dto.modificationId,
        vin: dto.vin,
        nickname: dto.nickname,
        mileage: dto.mileage,
        year: dto.year,
        color: dto.color,
      },
    });
  }

  async findAll(userId: number) {
    const garageUser = await this.getGarage(userId);

    return this.prisma.garageCar.findMany({
      where: {
        garageId: garageUser.id,
        garage: {
          userId,
        },
      },
      include: {
        modification: {
          include: {
            model: {
              include: {
                brand: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(userId: number, id: number) {
    const car = await this.getCarGarage(userId, id);
    if (!car) {
      throw new NotFoundException();
    }

    return car;
  }

  async update(userId: number, id: number, dto: UpdateGarageCarDto) {
    await this.findOne(userId, id);

    return this.prisma.garageCar.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  async remove(userId: number, id: number) {
    await this.findOne(userId, id);

    return this.prisma.garageCar.delete({
      where: {
        id,
      },
    });
  }
}
