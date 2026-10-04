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
import { CartResponse } from './dto/response.cart.dto';

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

  async getCart(userId: number): Promise<CartResponse> {
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
    // console.log(products);
    // console.log(result?.items);
    const total = products.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    return {
      ...result,
      id: result!.id,
      items: products.toSorted((a, b) => a.id - b.id),
      total,
    };
  }

  async syncItemsCart(
    userId: number,
    dto: AddToCartDto[],
  ): Promise<CartResponse> {
    const cart = await this.getOrCreateCart(userId);

    for (const item of dto) {
      const product = await this.parser.getItemDetails(item.itemNo);
      await this.prisma.cartItem.upsert({
        where: {
          cartId_itemNo: {
            cartId: cart.id,
            itemNo: item.itemNo,
          },
        },

        // Товар уже существует
        update: {
          quantity: {
            increment: item.quantity,
          },
          statusDelivery: item.statusDelivery,
        },

        // Товара ещё нет
        create: {
          cartId: cart.id,
          itemNo: item.itemNo,
          title: product?.item?.description ?? '',
          price: markupPercentPrice(product?.item?.price ?? 0),
          imageUrl: normalizeImagePath(product?.item?.firstPic) as string,
          quantity: item.quantity,
          statusDelivery: item.statusDelivery,
        },
      });

      // История
      await this.historyService.create(userId, HistoryAction.SYNC_CART, {
        itemNo: item.itemNo,
        quantity: item.quantity,
        statusDelivery: item.statusDelivery,
      });
    }
    return await this.getCart(userId);
  }

  async addItem(userId: number, dto: AddToCartDto) {
    const cart = await this.getOrCreateCart(userId);

    const product = await this.parser.getItemDetails(dto.itemNo);

    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.cartItem.findUnique({
        where: {
          cartId_itemNo: {
            cartId: cart.id,
            itemNo: dto.itemNo,
          },
        },
        select: {
          quantity: true,
        },
      });

      const cartItem = await tx.cartItem.upsert({
        where: {
          cartId_itemNo: {
            cartId: cart.id,
            itemNo: dto.itemNo,
          },
        },

        update: {
          quantity: {
            increment: dto.quantity,
          },
          statusDelivery: dto.statusDelivery,
        },

        create: {
          cartId: cart.id,
          itemNo: dto.itemNo,
          title: product?.item?.description ?? '',
          price: markupPercentPrice(product?.item?.price ?? 0),
          imageUrl: normalizeImagePath(product?.item?.firstPic) as string,
          quantity: dto.quantity,
          statusDelivery: dto.statusDelivery,
        },
      });

      if (existing) {
        await tx.history.create({
          data: {
            userId,
            action: HistoryAction.UPDATE_CART,
            metadata: {
              itemNo: dto.itemNo,
              quantity: existing.quantity + dto.quantity,
              statusDelivery: dto.statusDelivery,
            },
          },
        });
      } else {
        await tx.history.create({
          data: {
            userId,
            action: HistoryAction.ADD_TO_CART,
            metadata: {
              itemNo: dto.itemNo,
              quantity: dto.quantity,
              statusDelivery: dto.statusDelivery,
            },
          },
        });
      }
    });
    return this.getCart(userId);
  }

  async updateQuantity(
    userId: number,
    itemId: string,
    quantity: number,
  ): Promise<CartResponse> {
    const cart = await this.getOrCreateCart(userId);
console.log({quantity})
    await this.prisma.$transaction(async (tx) => {
      const item = await tx.cartItem.findUnique({
        where: {
          cartId_itemNo: {
            cartId: cart.id,
            itemNo: itemId,
          },
        },
      });

      if (!item) {
        throw new NotFoundException('Товар не найден в корзине');
      }

      const updatedItem = await tx.cartItem.update({
        where: {
          id: item.id,
        },
        data: {
          quantity,
        },
      });

      await tx.history.create({
        data: {
          userId,
          action: HistoryAction.UPDATE_CART,
          metadata: {
            itemNo: itemId,
            quantity,
          },
        },
      });

      return updatedItem;
    });
    return this.getCart(userId);
  }

  async removeItem(userId: number, itemId: string): Promise<CartResponse> {
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

    return this.getCart(userId);
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
