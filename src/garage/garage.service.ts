import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/core/prisma/prisma.service';

import { CreateGarageDto } from './dto/create-garage.dto';
import { UpdateGarageDto } from './dto/update-garage.dto';
import { GarageFromPrisma, GarageResponseDto } from './dto/response-garage.dto';

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

  /**
   * Приводим Prisma response
   * к GarageResponseDto.
   */
  normalizeGarage(garage: GarageFromPrisma[]): GarageResponseDto[] {
    return garage.map((g) => ({
      ...g,

      cars: g.cars.map((car) => ({
        ...car,

        vin: car.vin ?? '',
        nickname: car.nickname ?? '',

        modification: normalizeGarageModification(car.modification),
      })),
    }));
  }

  /**
   * Получить все гаражи пользователя.
   */
  async findAll(userId: number): Promise<GarageResponseDto[]> {
    const garages = await this.prisma.garage.findMany({
      where: {
        userId,
      },

      orderBy: [
        {
          isDefault: 'desc',
        },
        {
          id: 'desc',
        },
      ],

      select: garageSelect,
    });

    return this.normalizeGarage(garages);
  }

  /**
   * Создать гараж.
   *
   * Первый гараж автоматически становится default.
   */
  async create(
    userId: number,
    dto: CreateGarageDto,
  ): Promise<GarageResponseDto> {
    const existingGarage = await this.prisma.garage.findUnique({
      where: {
        userId_name: {
          userId,
          name: dto.name,
        },
      },
    });

    if (existingGarage) {
      throw new BadRequestException('Garage with this name already exists.');
    }

    const amountOfGarages = await this.prisma.garage.count({
      where: {
        userId,
      },
    });

    const isDefault = amountOfGarages === 0;

    const garage = await this.prisma.garage.create({
      data: {
        userId,
        name: dto.name,
        comment: dto.comment,
        isDefault,
      },

      select: garageSelect,
    });

    return this.normalizeGarage([garage])[0];
  }

  /**
   * Удалить гараж.
   *
   * Проверяем, что гараж принадлежит
   * текущему пользователю.
   */
  async remove(garageId: number, userId: number) {
    const garage = await this.prisma.garage.findFirst({
      where: {
        id: garageId,
        userId,
      },
    });

    if (!garage) {
      throw new NotFoundException('Garage not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.garage.delete({
        where: {
          id: garageId,
        },
      });

      /**
       * Если удалили default гараж,
       * назначаем default первым оставшимся.
       */
      if (garage.isDefault) {
        const nextGarage = await tx.garage.findFirst({
          where: {
            userId,
          },
          orderBy: {
            id: 'asc',
          },
        });

        if (nextGarage) {
          await tx.garage.update({
            where: {
              id: nextGarage.id,
            },
            data: {
              isDefault: true,
            },
          });
        }
      }
    });

    return {
      success: true,
    };
  }

  /**
   * Обновить гараж.
   */
  async edit(
    garageId: number,
    userId: number,
    dto: UpdateGarageDto,
  ): Promise<GarageResponseDto> {
    const garage = await this.prisma.garage.findFirst({
      where: {
        id: garageId,
        userId,
      },
    });

    if (!garage) {
      throw new NotFoundException('Garage not found');
    }

    try {
      const updatedGarage = await this.prisma.garage.update({
        where: {
          id: garageId,
        },

        data: {
          name: dto.name,
          comment: dto.comment,
        },

        select: garageSelect,
      });

      return this.normalizeGarage([updatedGarage])[0];
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

  /**
   * Сделать гараж default.
   *
   * У пользователя всегда только один default.
   */
  async setDefaultGarage(
    garageId: number,
    userId: number,
  ): Promise<GarageResponseDto> {
    const garage = await this.prisma.garage.findFirst({
      where: {
        id: garageId,
        userId,
      },
    });

    if (!garage) {
      throw new NotFoundException('Garage not found');
    }

    const updatedGarage = await this.prisma.$transaction(async (tx) => {
      await tx.garage.updateMany({
        where: {
          userId,
        },
        data: {
          isDefault: false,
        },
      });

      return tx.garage.update({
        where: {
          id: garageId,
        },

        data: {
          isDefault: true,
        },

        select: garageSelect,
      });
    });

    return this.normalizeGarage([updatedGarage])[0];
  }
}
