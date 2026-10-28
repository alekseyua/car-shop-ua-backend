import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { generateOrderNumber } from 'src/shared/common/helpers/helpers';
import { OrderStatus } from 'generated/prisma/enums';
import { TelegramService } from 'src/telegram/telegram.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramService: TelegramService,
  ) {}
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
      where: { id: cartId },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      throw new NotFoundException('Cart is empty');
    }

    const totalPrice = cart.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    // Сначала сохраняем заказ и очищаем корзину.
    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
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
        include: { items: true },
      });

      await tx.cartItem.deleteMany({
        where: { cartId },
      });

      return createdOrder;
    });

    // Транзакция уже завершилась успешно.
    try {
      await this.telegramService.sendOrderNotification({
        id: order.id,
        customerName:
          `${order.deliveryLastname} ${order.deliveryFirstname} ` +
          `(${order.userId ?? `Незареєстрований ${order.guestSessionId}`})`,
        phone: order.deliveryPhone,
        items: order.items.map((item) => ({
          name: item.title,
          itemNo: item.itemNo,
          quantity: item.quantity,
          price: Number(item.price),
        })),
        total: Number(order.totalPrice),
        delivery: [
          order.deliveryCity,
          order.deliveryStreet,
          order.deliveryHouse,
          order.deliveryApartment,
          order.deliveryPoint,
        ]
          .filter((value) => value != null && String(value).trim() !== '')
          .join(', '),
      });
    } catch (error) {
      console.error('Order notification failed:', {
        orderId: order.id,
        error,
      });
    }

    return order;
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
    userId: number | undefined,
    guestSessionId: string | undefined,
    dto: CreateOrderDto,
  ) {
    if (userId) {
      return this.createUserOrder(userId, dto);
    }

    if (guestSessionId) {
      return this.createGuestOrder(guestSessionId, dto);
    }

    throw new NotFoundException('User or guest session is required');
  }

  async findAllOrders(userId?: number, guestSessionId?: string) {
    if (userId) {
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

    if (guestSessionId) {
      return this.prisma.order.findMany({
        where: {
          guestSessionId,
        },
        include: {
          items: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return [];
  }

  async findOne(id: number, userId?: number, guestSessionId?: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        ...(userId ? { userId } : { guestSessionId }),
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

  async updateStatus(orderId: number, status: OrderStatus, userId: number) {
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
