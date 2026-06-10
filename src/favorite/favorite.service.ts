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
    productId: string,
  ) {
    const exists =
      await this.prisma.favorite.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

    if (exists) {
      return exists;
    }

    return this.prisma.favorite.create({
      data: {
        userId,
        productId,
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
    productId: string,
  ) {
    const favorite =
      await this.prisma.favorite.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

    return {
      isFavorite: !!favorite,
    };
  }

  async remove(
    userId: number,
    productId: string,
  ) {
    await this.prisma.favorite.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return {
      success: true,
    };
  }
}
