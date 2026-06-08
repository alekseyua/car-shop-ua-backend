import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class AddressService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async create(
    userId: number,
    dto: CreateAddressDto,
  ) {
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    return this.prisma.address.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.address.findMany({
      where: {
        userId,
      },
      orderBy: {
        isDefault: 'desc',
      },
    });
  }

  async setDefault(
    userId: number,
    addressId: number,
  ) {
    const address =
      await this.prisma.address.findFirst({
        where: {
          id: addressId,
          userId,
        },
      });

    if (!address) {
      throw new NotFoundException();
    }

    await this.prisma.address.updateMany({
      where: {
        userId,
      },
      data: {
        isDefault: false,
      },
    });

    return this.prisma.address.update({
      where: {
        id: addressId,
      },
      data: {
        isDefault: true,
      },
    });
  }

  async remove(
    userId: number,
    addressId: number,
  ) {
    const address =
      await this.prisma.address.findFirst({
        where: {
          id: addressId,
          userId,
        },
      });

    if (!address) {
      throw new NotFoundException();
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

  findOne(id: number) {
    return `This action returns a #${id} address`;
  }

  update(id: number, updateAddressDto: UpdateAddressDto) {
    return `This action updates a #${id} address`;
  }

  
}
