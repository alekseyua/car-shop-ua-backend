import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { AddToCartDto } from './dto/add-cart.dto';
import {
  generateOrderNumber,
  getProductFromPrice,
  markupPercentPrice,
  normalizeDoubleNumber,
  normalizeImagePath,
} from 'src/shared/common/helpers/helpers';
import { CheckoutDto } from './dto/query-cart.dto';
import { HistoryAction } from 'generated/prisma/browser';
import { HistoryService } from 'src/history/history.service';
import { ParserService } from 'src/integrations/parser/parser.service';
import { IoredisService } from 'src/core/ioredis/ioredis.service';

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly parser: ParserService,
    private readonly historyService: HistoryService,
    private readonly redis: IoredisService,
  ) {}

  private async getOrCreateCart(userId: number) {
    let cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId,
        },
      });
    }
    return cart;
  }

  async getCart(userId: number) {
    const cart = await this.getOrCreateCart(userId);
    const result = await this.prisma.cart.findUnique({
      where: {
        id: cart.id,
      },
      include: {
        items: true,
      },
    });
    const products = await Promise.all(
      result!.items.map(async (item) => {
        const priceFromCache = await getProductFromPrice(
          item.itemNo,
          this.redis,
        );

        const price =
          priceFromCache?.price != null
            ? Number(priceFromCache.price)
            : Number(item.price);

        return {
          ...item,
          price: markupPercentPrice(normalizeDoubleNumber(price)),
        };
      }),
    );
    console.log(products);
    console.log(result?.items);
    const total = products.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    return {
      ...result,
      items: products.toSorted((a, b) => a.id - b.id),
      total,
    };
  }

  async addItem(userId: number, dto: AddToCartDto) {
    const cart = await this.getOrCreateCart(userId);

    const existing = await this.prisma.cartItem.findUnique({
      where: {
        cartId_itemNo: {
          cartId: cart.id,
          itemNo: dto.itemNo,
        },
      },
    });

    if (existing) {
      const updatedQuantity = existing.quantity + dto.quantity;
      await this.historyService.create(userId, HistoryAction.UPDATE_CART, {
        itemNo: dto.itemNo,
        quantity: updatedQuantity,
        statusDelivery: dto.statusDelivery,
      });
      return await this.prisma.cartItem.update({
        where: {
          id: existing.id,
        },
        data: {
          quantity: updatedQuantity,
        },
      });
    }

    await this.historyService.create(userId, HistoryAction.ADD_TO_CART, {
      itemNo: dto.itemNo,
      quantity: dto.quantity,
      statusDelivery: dto.statusDelivery,
    });
    const product = await this.parser.getItemDetails(dto.itemNo);
    return await this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        itemNo: dto.itemNo,
        title: product?.item?.description ?? '',
        price: markupPercentPrice(product?.item?.price ?? 0),
        imageUrl: normalizeImagePath(product?.item?.firstPic) as string,
        quantity: dto.quantity,
        statusDelivery: dto.statusDelivery,
      },
    });
  }

  async updateQuantity(userId: number, itemId: string, quantity: number) {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.prisma.cartItem.findFirst({
      where: {
        itemNo: itemId,
        cartId: cart.id,
      },
    });

    if (!item) {
      throw new NotFoundException();
    }
    await this.historyService.create(userId, HistoryAction.UPDATE_CART, {
      itemNo: itemId,
      quantity: quantity,
    });
    return this.prisma.cartItem.update({
      where: {
        id: item.id,
      },
      data: {
        quantity,
      },
    });
  }

  async removeItem(userId: number, itemId: string) {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.prisma.cartItem.findFirst({
      where: {
        itemNo: itemId,
        cartId: cart.id,
      },
    });

    if (!item) {
      throw new NotFoundException();
    }
    await this.historyService.create(userId, HistoryAction.REMOVE_FROM_CART, {
      itemNo: itemId,
    });
    await this.prisma.cartItem.delete({
      where: {
        id: item.id,
      },
    });

    return {
      success: true,
    };
  }

  async clearCart(userId: number) {
    const cart = await this.getOrCreateCart(userId);

    await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });
    await this.historyService.create(userId, HistoryAction.CLEAR_CART);
    return {
      success: true,
    };
  }

  async createFromCart(userId: number, dto: CheckoutDto) {
    return this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: {
          userId,
        },
        include: {
          items: true,
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      const totalPrice = cart.items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0,
      );

      const order = await tx.order.create({
        data: {
          userId,
          orderNumber: generateOrderNumber(),
          totalPrice,

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
      await this.historyService.create(userId, HistoryAction.CREATE_ORDER);

      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      return order;
    });
  }
}
