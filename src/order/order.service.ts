import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { generateOrderNumber } from 'src/shared/common/helpers/helpers';
import { OrderStatus } from 'generated/prisma/enums';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}
  /**
   * пока логика такая что создаетс заказ  исход из элементов в корзине,
   * но в дальнейшем нужно сделать чекбоксы и выбирать нужные элементы для заказа, а не все из корзины
   * @param userId
   * @param dto
   * @returns
   */
  async create(userId: number, dto: CreateOrderDto) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
    });

    const cartItems = await this.prisma.cartItem.findMany({
      where: {
        cartId: cart?.id,
      },
    });
    const totalPrice = cartItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );
    if (cartItems.length === 0) {
      throw new NotFoundException('Cart is empty');
    }

    const orderNumber = generateOrderNumber();
    console.log({ cartItems });
    const order = await this.prisma.order.create({
      data: {
        userId,
        totalPrice,
        orderNumber: orderNumber,

        deliveryCity: dto.deliveryCity,
        deliveryPhone: dto.deliveryPhone,
        deliveryEmail: dto.deliveryEmail,
        deliveryLastname: dto.deliveryLastname,
        deliveryFirstname: dto.deliveryFirstname,
        deliveryMiddlename: dto.deliveryMiddlename,
        deliveryComment: dto.deliveryComment,
        deliveryVin: dto.deliveryVin,
        deliveryPoint: dto.deliveryPoint,
        deliveryPointRef: dto.deliveryPointRef,

        deliveryStreet: dto.deliveryStreet,
        deliveryHouse: dto.deliveryHouse,
        deliveryApartment: dto.deliveryApartment,

        items: {
          create: cartItems.map((item) => ({
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
    if (order && cart?.id) {
      await this.prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });
    }
    return order;
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

  async updateStatus(orderId: number, status: OrderStatus) {
    return this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
        ...(status === OrderStatus.PAID && {
          paidAt: new Date(),
        }),
        ...(status === OrderStatus.SHIPPED && {
          shippedAt: new Date(),
        }),
        ...(status === OrderStatus.DELIVERED && {
          deliveredAt: new Date(),
        }),
      },
    });
  }
}
