import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { generateOrderNumber } from 'src/shared/common/helpers/helpers';
import { OrderStatus } from 'generated/prisma/enums';

@Injectable()
export class OrderService {

  constructor(private readonly prisma: PrismaService) { }

    async create(userId: number, dto: CreateOrderDto) {
      const totalPrice = dto.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      const orderNumber = generateOrderNumber();

      return this.prisma.order.create({
        data: {
          userId,
          totalPrice,
          orderNumber: orderNumber,

          deliveryCountry: dto.deliveryCountry,
          deliveryCity: dto.deliveryCity,
          deliveryStreet: dto.deliveryStreet,
          deliveryHouse: dto.deliveryHouse,
          deliveryApartment: dto.deliveryApartment,
          deliveryPostalCode: dto.deliveryPostalCode,

          items: {
            create: dto.items.map((item) => ({
              itemNo: item.itemNo,
              title: item.title,
              quantity: item.quantity,
              price: item.price,
              imageUrl: item.imageUrl,
            })),
          },
        },
        include: {
          items: true,
        },
      });

  }

  async findAll(userId: number) {
    return this.prisma.order.findMany({
      where: {
        userId,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }


  async findOne(id: number, userId: number) {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(
    orderId: number,
    status: OrderStatus,
  ) {
    const data: any = {
      status,
    };

    if (status === OrderStatus.PAID) {
      data.paidAt = new Date();
    }

    if (status === OrderStatus.SHIPPED) {
      data.shippedAt = new Date();
    }

    if (status === OrderStatus.DELIVERED) {
      data.deliveredAt = new Date();
    }

    return this.prisma.order.update({
      where: {
        id: orderId,
      },
      data,
    });
  }
}
