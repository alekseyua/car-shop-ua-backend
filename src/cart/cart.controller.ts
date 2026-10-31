import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-cart.dto';
import { CheckoutDto } from './dto/query-cart.dto';
import { UpdateCartQuantityDto } from './dto/update-cart.dto';

import { CurrentUser } from 'src/auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { CartResponse } from './dto/response.cart.dto';
import { GuestSession } from 'src/guest-session/decorators/guestSession';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';

@ApiBearerAuth()
@Controller('cart')
@UseGuards(OptionalJwtAuthGuard)
export class CartController {
  private readonly logger = new Logger(CartController.name);
  constructor(private readonly cartService: CartService) {}

  /**
   * Получить корзину.
   *
   * Авторизованный:
   *   userId
   *
   * Гость:
   *   guestSessionId
   */
  @Get()
  getCart(
    @CurrentUser() user: Express.User | undefined,
    @GuestSession() guestSessionId: string | undefined,
  ): Promise<CartResponse> {
    this.logger.log('getCart ', { user, guestSessionId });
    return this.cartService.getCart(user?.userId, guestSessionId);
  }

  /**
   * Добавить товар в корзину.
   */
  @Post('items')
  addItem(
    @GuestSession() guestSessionId: string | undefined,
    @CurrentUser() user: Express.User | undefined,
    @Body() dto: AddToCartDto,
  ): Promise<CartResponse> {
    this.logger.log('addItem ',{ user, guestSessionId });

    return this.cartService.addItem(user?.userId, guestSessionId, dto);
  }

  /**
   * Изменить количество товара.
   */
  @ApiOkResponse({
    description: 'Quantity update',
  })
  @Patch('update-quantity/:id')
  updateQuantity(
    @GuestSession() guestSessionId: string | undefined,
    @CurrentUser() user: Express.User | undefined,
    @Param('id') itemId: string,
    @Body() dto: UpdateCartQuantityDto,
  ): Promise<CartResponse> {
    return this.cartService.updateQuantity(
      user?.userId,
      guestSessionId,
      itemId,
      dto.quantity,
    );
  }

  /**
   * Удалить товар.
   */
  @Delete('items/:id')
  removeItem(
    @GuestSession() guestSessionId: string | undefined,
    @CurrentUser() user: Express.User | undefined,
    @Param('id') itemId: string,
  ): Promise<CartResponse> {
    return this.cartService.removeItem(user?.userId, guestSessionId, itemId);
  }

  /**
   * Очистить корзину.
   */
  @Delete()
  clearCart(
    @CurrentUser() user: Express.User | undefined,
    @GuestSession() guestSessionId: string | undefined,
  ) {
    return this.cartService.clearCart(user?.userId, guestSessionId);
  }

  /**
   * Создать заказ из корзины.
   */
  @Post('checkout')
  checkout(
    @CurrentUser() user: Express.User | undefined,
    @Body() dto: CheckoutDto,
    @GuestSession() guestSessionId: string | undefined,
  ) {
    return this.cartService.createFromCart(user?.userId, guestSessionId, dto);
  }

  /**
   * Синхронизация корзины.
   */
  @Post('merge')
  sync(
    @CurrentUser() user: Express.User | undefined,
    @GuestSession() guestSessionId: string | undefined,
    @Req() req,
  ) {
    console.log({
      url: req.originalUrl,
      cookies: req.cookies,
      cookieHeader: req.headers.cookie,
    });
    return this.cartService.mergeGuestCart(user?.userId, guestSessionId);
  }
}
