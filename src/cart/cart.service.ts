import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { AddToCartDto } from './dto/add-cart.dto';
import { generateOrderNumber } from 'src/shared/common/helpers/helpers';
import { CheckoutDto } from './dto/query-cart.dto';
import { HistoryAction } from 'generated/prisma/browser';
import { HistoryService } from 'src/history/history.service';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService, 
    private readonly historyService: HistoryService,
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
    console.log({cart})
    return cart;
  }

  async getCart(userId: number) {
    try {
      const cart = await this.getOrCreateCart(userId);
  
      const result = await this.prisma.cart.findUnique({
        where: {
          id: cart.id,
        },
        include: {
          items: true,
        },
      });
  
      const total = result!.items.reduce(
        (sum, item) =>
          sum + Number(item.price) * item.quantity,
        0,
      );
  
      return {
        ...result,
        total,
      };
      
    } catch (error) {
      throw error;
    }
  }

  async addItem(
    userId: number,
    dto: AddToCartDto,
  ) {
    const cart = await this.getOrCreateCart(userId);

    const existing =
      await this.prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: dto.productId,
          },
        },
      });

    if (existing) {
      const updatedQuantity = existing.quantity + dto.quantity;
      await this.historyService.create(
        userId,
        HistoryAction.UPDATE_CART,
        {
          productId: dto.productId,
          quantity: updatedQuantity,
        },
      );
      return this.prisma.cartItem.update({
        where: {
          id: existing.id,
        },
        data: {
          quantity: updatedQuantity,
        },
      });
    }
    
    await this.historyService.create(
      userId,
      HistoryAction.ADD_TO_CART,
      {
        productId: dto.productId,
        quantity: dto.quantity,
      },
    );

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: dto.productId,
        title: dto.title,
        price: dto.price,
        imageUrl: dto.imageUrl,
        quantity: dto.quantity,
      },
    });
  }

  async updateQuantity(
    userId: number,
    itemId: number,
    quantity: number,
  ) {
    const cart = await this.getOrCreateCart(userId);

    const item =
      await this.prisma.cartItem.findFirst({
        where: {
          id: itemId,
          cartId: cart.id,
        },
      });

    if (!item) {
      throw new NotFoundException();
    }
    await this.historyService.create(
      userId,
      HistoryAction.UPDATE_CART,
      {
        productId: itemId,
        quantity: quantity,
      },
    );
    return this.prisma.cartItem.update({
      where: {
        id: item.id,
      },
      data: {
        quantity,
      },
    });
  }

  async removeItem(
    userId: number,
    itemId: number,
  ) {
    const cart = await this.getOrCreateCart(userId);

    const item =
      await this.prisma.cartItem.findFirst({
        where: {
          id: itemId,
          cartId: cart.id,
        },
      });

    if (!item) {
      throw new NotFoundException();
    }
    await this.historyService.create(
      userId,
      HistoryAction.REMOVE_FROM_CART,
      {
        productId: itemId,
      },
    );
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
    await this.historyService.create(
      userId,
      HistoryAction.CLEAR_CART,
    );
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
        throw new BadRequestException(
          'Cart is empty',
        );
      }

      const totalPrice = cart.items.reduce(
        (sum, item) =>
          sum + Number(item.price) * item.quantity,
        0,
      );

      const order = await tx.order.create({
        data: {
          userId,
          orderNumber: generateOrderNumber(),
          totalPrice,

          deliveryCountry: dto.deliveryCountry,
          deliveryCity: dto.deliveryCity,
          deliveryStreet: dto.deliveryStreet,
          deliveryHouse: dto.deliveryHouse,

          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
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
      await this.historyService.create(
        userId,
        HistoryAction.CREATE_ORDER,
      );

      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      return order;
    });
  }
}
