import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateGarageDto } from './dto/create-garage.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GarageResponseDto } from './dto/response-garage.dto';
import { UpdateGarageDto } from './dto/update-garage.dto';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class GarageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreateGarageDto): Promise<GarageResponseDto> {
    const garage = await this.prisma.garage.findUnique({
      where: {
        userId_name:{
          userId,
          name: dto.name
        }
      },
    });
    console.log({garage})
    if(garage){
      throw new BadRequestException('Garage with this name already exists.')
    }
    // if (garage) {
    //   throw new BadRequestException('Garage already exists');
    // }

    const response = await this.prisma.garage.create({
      data: {
        userId,
        name: dto.name,
        comment: dto.comment,
      },
      select: { 
        id: true,
        name: true,
        comment: true,
      }
    });
    return response;
  }

  async findAll(userId: number): Promise<GarageResponseDto[]> {
    return this.prisma.garage.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        name: true,
        comment: true,
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
                model: true,
                typeRange: true,
                engineType: true,
                kw: true,
                hp: true,
                bodyType: true,
              },
            },
          },
        },
      }
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

  async edit (id: number, userId: number, dto: UpdateGarageDto) {
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
        throw new BadRequestException(
          'Garage with this name already exists.',
        );
      }

      throw error;
    }
  }
}
