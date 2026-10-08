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

  /**
   * Возвращает корзину пользователя или гостя.
   *
   * userId имеет приоритет над guestSessionId.
   */
  private async getOrCreateCart(userId?: number, guestSessionId?: string) {
    if (userId) {
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

    if (guestSessionId) {
      let cart = await this.prisma.cart.findUnique({
        where: {
          guestSessionId,
        },
      });

      if (!cart) {
        cart = await this.prisma.cart.create({
          data: {
            guestSessionId,
          },
        });
      }

      return cart;
    }

    throw new BadRequestException('User or guest session is required');
  }

  /**
   * Получить корзину.
   */
  async getCart(
    userId?: number,
    guestSessionId?: string,
  ): Promise<CartResponse> {
    const cart = await this.getOrCreateCart(userId, guestSessionId);

    const result = await this.prisma.cart.findUnique({
      where: {
        id: cart.id,
      },
      include: {
        items: true,
      },
    });

    if (!result) {
      throw new NotFoundException('Cart not found');
    }

    const products = await Promise.all(
      result.items.map(async (item) => {
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

    const total = products.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return {
      ...result,
      id: result.id,
      items: products.toSorted((a, b) => a.id - b.id),
      total,
    };
  }

  /**
   * Синхронизация корзины.
   *
   * Работает и для user, и для guest.
   */
  async syncItemsCart(
    userId: number | undefined,
    guestSessionId: string | undefined,
    dto: AddToCartDto[],
  ): Promise<CartResponse> {
    const cart = await this.getOrCreateCart(userId, guestSessionId);

    for (const item of dto) {
      const product = await this.parser.getItemDetails(item.itemNo);

      await this.prisma.cartItem.upsert({
        where: {
          cartId_itemNo: {
            cartId: cart.id,
            itemNo: item.itemNo,
          },
        },

        update: {
          quantity: {
            increment: item.quantity,
          },
          statusDelivery: item.statusDelivery,
        },

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

      /**
       * History сейчас привязан к userId.
       *
       * Поэтому для guest history не создаём.
       */
      if (userId) {
        await this.historyService.create(userId, HistoryAction.SYNC_CART, {
          itemNo: item.itemNo,
          quantity: item.quantity,
          statusDelivery: item.statusDelivery,
        });
      }
    }

    return this.getCart(userId, guestSessionId);
  }

  /**
   * Добавить товар.
   */
  async addItem(
    userId: number | undefined,
    guestSessionId: string | undefined,
    dto: AddToCartDto,
  ): Promise<CartResponse> {
    const cart = await this.getOrCreateCart(userId, guestSessionId);

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

      await tx.cartItem.upsert({
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

      /**
       * История только для авторизованного пользователя.
       */
      if (userId) {
        await tx.history.create({
          data: {
            userId,
            action: existing
              ? HistoryAction.UPDATE_CART
              : HistoryAction.ADD_TO_CART,
            metadata: {
              itemNo: dto.itemNo,
              quantity: existing
                ? existing.quantity + dto.quantity
                : dto.quantity,
              statusDelivery: dto.statusDelivery,
            },
          },
        });
      }
    });

    return this.getCart(userId, guestSessionId);
  }

  /**
   * Изменить количество товара.
   */
  async updateQuantity(
    userId: number | undefined,
    guestSessionId: string | undefined,
    itemId: string,
    quantity: number,
  ): Promise<CartResponse> {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    const cart = await this.getOrCreateCart(userId, guestSessionId);

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

      await tx.cartItem.update({
        where: {
          id: item.id,
        },
        data: {
          quantity,
        },
      });

      if (userId) {
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
      }
    });

    return this.getCart(userId, guestSessionId);
  }

  /**
   * Удалить товар.
   */
  async removeItem(
    userId: number | undefined,
    guestSessionId: string | undefined,
    itemId: string,
  ): Promise<CartResponse> {
    const cart = await this.getOrCreateCart(userId, guestSessionId);

    const item = await this.prisma.cartItem.findFirst({
      where: {
        itemNo: itemId,
        cartId: cart.id,
      },
    });

    if (!item) {
      throw new NotFoundException('Товар не найден в корзине');
    }

    if (userId) {
      await this.historyService.create(userId, HistoryAction.REMOVE_FROM_CART, {
        itemNo: itemId,
      });
    }

    await this.prisma.cartItem.delete({
      where: {
        id: item.id,
      },
    });

    return this.getCart(userId, guestSessionId);
  }

  /**
   * Очистить корзину.
   */
  async clearCart(userId?: number, guestSessionId?: string) {
    const cart = await this.getOrCreateCart(userId, guestSessionId);

    await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    if (userId) {
      await this.historyService.create(userId, HistoryAction.CLEAR_CART);
    }

    return {
      success: true,
    };
  }

  /**
   * Создать заказ из корзины.
   *
   * Поддерживает:
   *   userId
   *   guestSessionId
   */
  async createFromCart(
    userId: number | undefined,
    guestSessionId: string | undefined,
    dto: CheckoutDto,
  ) {
    const cart = await this.getOrCreateCart(userId, guestSessionId);

    return this.prisma.$transaction(async (tx) => {
      const currentCart = await tx.cart.findUnique({
        where: {
          id: cart.id,
        },
        include: {
          items: true,
        },
      });

      if (!currentCart || currentCart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      const totalPrice = currentCart.items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0,
      );

      const order = await tx.order.create({
        data: {
          userId: userId ?? null,
          guestSessionId: userId ? null : (guestSessionId ?? null),

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
            create: currentCart.items.map((item) => ({
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

      /**
       * History только для авторизованного.
       */
      if (userId) {
        await tx.history.create({
          data: {
            userId,
            action: HistoryAction.CREATE_ORDER,
          },
        });
      }

      await tx.cartItem.deleteMany({
        where: {
          cartId: currentCart.id,
        },
      });

      return order;
    });
  }

  async mergeGuestCart(
    userId: number | undefined,
    guestSessionId: string | undefined,
  ): Promise<CartResponse> {
    if (!userId) {
      throw new BadRequestException('Authorization is required');
    }

    if (!guestSessionId) {
      return this.getCart(userId);
    }

    const guestCart = await this.prisma.cart.findUnique({
      where: {
        guestSessionId,
      },
      include: {
        items: true,
      },
    });

    /**
     * У гостя нет корзины.
     * Просто возвращаем пользовательскую.
     */
    if (!guestCart || guestCart.items.length === 0) {
      return this.getCart(userId);
    }

    const userCart = await this.getOrCreateCart(userId);

    await this.prisma.$transaction(async (tx) => {
      for (const guestItem of guestCart.items) {
        const existingItem = await tx.cartItem.findUnique({
          where: {
            cartId_itemNo: {
              cartId: userCart.id,
              itemNo: guestItem.itemNo,
            },
          },
        });

        if (existingItem) {
          /**
           * Товар уже есть у пользователя.
           * Складываем количество.
           */
          await tx.cartItem.update({
            where: {
              id: existingItem.id,
            },
            data: {
              quantity: existingItem.quantity + guestItem.quantity,

              /**
               * Берём актуальные данные
               * гостевого товара.
               */
              statusDelivery: guestItem.statusDelivery,
            },
          });
        } else {
          /**
           * Товара нет в user cart.
           * Переносим его.
           */
          await tx.cartItem.create({
            data: {
              cartId: userCart.id,
              itemNo: guestItem.itemNo,
              title: guestItem.title,
              price: guestItem.price,
              imageUrl: guestItem.imageUrl,
              quantity: guestItem.quantity,
              statusDelivery: guestItem.statusDelivery,
            },
          });
        }
      }

      /**
       * После успешного merge
       * удаляем guest items.
       */
      await tx.cartItem.deleteMany({
        where: {
          cartId: guestCart.id,
        },
      });

      /**
       * Саму guest cart тоже можно удалить.
       */
      await tx.cart.delete({
        where: {
          id: guestCart.id,
        },
      });
    });

    return this.getCart(userId);
  }
}
