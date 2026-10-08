import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создать адрес пользователя.
   *
   * Если isDefault = true,
   * все остальные адреса пользователя
   * становятся не default.
   */
  async create(userId: number, dto: CreateAddressDto) {
    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.address.updateMany({
          where: {
            userId,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      return tx.address.create({
        data: {
          ...dto,
          userId,
        },
      });
    });
  }

  /**
   * Получить все адреса текущего пользователя.
   */
  async findAll(userId: number) {
    return this.prisma.address.findMany({
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
    });
  }

  /**
   * Получить конкретный адрес.
   *
   * ВАЖНО:
   * ищем одновременно по id и userId,
   * чтобы нельзя было получить чужой адрес.
   */
  async findOne(userId: number, addressId: number) {
    const address = await this.prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  /**
   * Сделать адрес основным.
   */
  async setDefault(userId: number, addressId: number) {
    const address = await this.prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return this.prisma.$transaction(async (tx) => {
      /**
       * Сначала снимаем default
       * со всех адресов пользователя.
       */
      await tx.address.updateMany({
        where: {
          userId,
        },
        data: {
          isDefault: false,
        },
      });

      /**
       * Затем устанавливаем default
       * нужному адресу.
       */
      return tx.address.update({
        where: {
          id: addressId,
        },
        data: {
          isDefault: true,
        },
      });
    });
  }

  /**
   * Обновить адрес.
   *
   * Адрес можно изменить только если
   * он принадлежит текущему пользователю.
   */
  async update(userId: number, addressId: number, dto: UpdateAddressDto) {
    const address = await this.prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return this.prisma.$transaction(async (tx) => {
      /**
       * Если обновляемый адрес
       * становится default,
       * снимаем default с остальных.
       */
      if (dto.isDefault) {
        await tx.address.updateMany({
          where: {
            userId,
            id: {
              not: addressId,
            },
          },
          data: {
            isDefault: false,
          },
        });
      }

      return tx.address.update({
        where: {
          id: addressId,
        },
        data: dto,
      });
    });
  }

  /**
   * Удалить адрес.
   */
  async remove(userId: number, addressId: number) {
    const address = await this.prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.prisma.address.delete({
      where: {
        id: addressId,
      },
    });

    return {
      success: true,
    };
  }
}
