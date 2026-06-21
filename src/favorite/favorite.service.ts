import { Injectable } from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class FavoriteService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async findAll(userId: number) {
    return this.prisma.favorite.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(
    userId: number,
    itemNo: string,
  ) {
    const exists =
      await this.prisma.favorite.findUnique({
        where: {
          userId_itemNo: {
            userId,
            itemNo,
          },
        },
      });

    if (exists) {
      return exists;
    }

    return this.prisma.favorite.create({
      data: {
        userId,
        itemNo,
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} favorite`;
  }

  update(id: number, updateFavoriteDto: UpdateFavoriteDto) {
    return `This action updates a #${id} favorite`;
  }
  
  async isFavorite(
    userId: number,
    itemNo: string,
  ) {
    const favorite =
      await this.prisma.favorite.findUnique({
        where: {
          userId_itemNo: {
            userId,
            itemNo,
          },
        },
      });

    return {
      isFavorite: !!favorite,
    };
  }

  async remove(
    userId: number,
    itemNo: string,
  ) {
    await this.prisma.favorite.delete({
      where: {
        userId_itemNo: {
          userId,
          itemNo,
        },
      },
    });

    return {
      success: true,
    };
  }
}
