import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}
  async create(
    userId: number,
    dto: CreateReviewDto,
  ) {
    const exists =
      await this.prisma.review.findUnique({
        where: {
          userId_productId: {
            userId,
            productId: dto.productId,
          },
        },
      });

    if (exists) {
      throw new BadRequestException(
        'Review already exists',
      );
    }

    return this.prisma.review.create({
      data: {
        userId,
        productId: dto.productId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });
  }

  async update(
    userId: number,
    productId: string,
    dto: UpdateReviewDto,
  ) {
    return this.prisma.review.update({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      data: dto,
    });
  }

  async remove(
    userId: number,
    productId: string,
  ) {
    await this.prisma.review.delete({
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

  async findByProduct(
    productId: string,
  ) {
    return this.prisma.review.findMany({
      where: {
        productId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getStats(
    productId: string,
  ) {
    const stats =
      await this.prisma.review.aggregate({
        where: {
          productId,
        },
        _avg: {
          rating: true,
        },
        _count: true,
      });

    return {
      averageRating:
        Number(stats._avg.rating ?? 0),
      totalReviews: stats._count,
    };
  }
}
