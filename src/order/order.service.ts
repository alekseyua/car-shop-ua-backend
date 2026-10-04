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
  private async createOrderFromCart(
    cartId: number,
    userId: number | null,
    guestSessionId: string | null,
    dto: CreateOrderDto,
  ) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        id: cartId,
      },
      include: {
        items: true,
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new NotFoundException('Cart is empty');
    }

    const totalPrice = cart.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          guestSessionId,
          totalPrice,
          orderNumber: generateOrderNumber(),

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
            create: cart.items.map((item) => ({
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

      await tx.cartItem.deleteMany({
        where: {
          cartId,
        },
      });

      return order;
    });
  }

  private async createUserOrder(userId: number, dto: CreateOrderDto) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return this.createOrderFromCart(cart.id, userId, null, dto);
  }
  private async createGuestOrder(guestSessionId: string, dto: CreateOrderDto) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        guestSessionId,
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return this.createOrderFromCart(cart.id, null, guestSessionId, dto);
  }

  async create(
    userId: number | null,
    guestSessionId: string | null,
    dto: CreateOrderDto,
  ) {
    console.log({ userId, guestSessionId });
    if (!userId && guestSessionId) {
      return this.createGuestOrder(guestSessionId, dto);
    }

    if (userId && !guestSessionId) {
      return this.createUserOrder(userId, dto);
    }
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
