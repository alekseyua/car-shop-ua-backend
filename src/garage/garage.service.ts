import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGarageDto } from './dto/create-garage.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GarageFromPrisma, GarageResponseDto } from './dto/response-garage.dto';
import { UpdateGarageDto } from './dto/update-garage.dto';
import { Prisma } from 'generated/prisma/client';
import { normalizeGarageModification } from 'src/shared/common/helpers/helpers';

export const garageSelect = {
  id: true,
  name: true,
  comment: true,
  isDefault: true,

  cars: {
    select: {
      id: true,
      vin: true,
      nickname: true,

      modification: {
        select: {
          id: true,
          modificationAutotechId: true,
          typeName: true,
          typeRange: true,
          kw: true,
          hp: true,
          image: true,
          modelId: true,

          model: {
            select: {
              model: true,

              brand: {
                select: {
                  mark: true,
                },
              },
            },
          },

          engineType: {
            select: {
              name: true,
            },
          },

          bodyType: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.GarageSelect;

@Injectable()
export class GarageService {
  constructor(private readonly prisma: PrismaService) {}

  normalizeGarage(garage: GarageFromPrisma[]): GarageResponseDto[] {
    return garage.map((g) => ({
      ...g,
      cars: [
        ...g.cars.map((gc) => ({
          ...gc,
          vin: gc.vin ?? '',
          nickname: gc.nickname ?? '',
          modification: normalizeGarageModification(gc.modification),
        })),
      ],
    }));
  }

  async findAll(userId: number): Promise<GarageResponseDto[]> {
    const garage = await this.prisma.garage.findMany({
      where: {
        userId,
      },
      orderBy: {
        isDefault: 'desc',
      },
      select: garageSelect,
    });
    const data = this.normalizeGarage(garage);
    return data;
  }

  async create(
    userId: number,
    dto: CreateGarageDto,
  ): Promise<GarageResponseDto> {
    const amountOfGarages = await this.prisma.garage.count({
      where: {
        userId,
      },
    });
    const garage = await this.prisma.garage.findUnique({
      where: {
        userId_name: {
          userId,
          name: dto.name,
        },
      },
    });
    if (garage) {
      throw new BadRequestException('Garage with this name already exists.');
    }
    // if (garage) {
    //   throw new BadRequestException('Garage already exists');
    // }

    const response = await this.prisma.garage.create({
      data: {
        userId,
        name: dto.name,
        comment: dto.comment,
        isDefault: amountOfGarages === 0,
      },
      select: {
        id: true,
        name: true,
        comment: true,
        isDefault: true,
      },
    });
    return { ...response, cars: [] };
  }

  async remove(id: number, userId: number) {
    return this.prisma.garage.delete({
      where: {
        id,
        userId,
      },
    });
  }

  async edit(id: number, userId: number, dto: UpdateGarageDto) {
    const garage = await this.prisma.garage.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!garage) {
      throw new NotFoundException('Garage not found');
    }

    try {
      return await this.prisma.garage.update({
        where: {
          id,
        },
        data: {
          name: dto.name,
          comment: dto.comment,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Garage with this name already exists.');
      }

      throw error;
    }
  }
  async setDefaultGarage(id: number, userId: number) {
    const garage = await this.prisma.garage.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!garage) {
      throw new NotFoundException('Garage not found');
    }

    await this.prisma.garage.updateMany({
      where: {
        userId,
      },
      data: {
        isDefault: false,
      },
    });

    return this.prisma.garage.update({
      where: {
        id,
      },
      data: {
        isDefault: true,
      },
    });
  }
}
