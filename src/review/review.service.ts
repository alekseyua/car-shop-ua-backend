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
    const hasPurchased =
      await this.prisma.orderItem.findFirst({
        where: {
          itemNo: dto.itemNo,
          order: {
            userId,
            status: 'DELIVERED',
          },
        },
      });
    
    if (!hasPurchased) {
      throw new BadRequestException(
        'You can only review products you have purchased',
      );
    }

    const exists =
      await this.prisma.review.findUnique({
        where: {
          userId_itemNo: {
            userId,
            itemNo: dto.itemNo,
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
        itemNo: dto.itemNo,
        rating: dto.rating,
        comment: dto.comment,
      },
    });
  }

  async update(
    userId: number,
    itemNo: string,
    dto: UpdateReviewDto,
  ) {
    return this.prisma.review.update({
      where: {
        userId_itemNo: {
          userId,
          itemNo,
        },
      },
      data: dto,
    });
  }

  async remove(
    userId: number,
    itemNo: string,
  ) {
    await this.prisma.review.delete({
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

  async findByProduct(
    itemNo: string,
  ) {
    return this.prisma.review.findMany({
      where: {
        itemNo,
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
    itemNo: string,
  ) {
    const stats =
      await this.prisma.review.aggregate({
        where: {
          itemNo,
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
