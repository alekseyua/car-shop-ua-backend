import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-cart.dto';
import { CheckoutDto } from './dto/query-cart.dto';
import { UpdateCartQuantityDto } from './dto/update-cart.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: Express.User) {
    const userId = user.userId;
    return this.cartService.getCart(userId);
  }

  @Post('items')
  addItem(@CurrentUser() user: Express.User, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(user.userId, dto);
  }

  @ApiOkResponse({
    description: 'Quantity update',
  })
  @Patch('update-quantity/:id')
  updateQuantity(
    @CurrentUser() user: Express.User,
    @Param('id') itemId: string,
    @Body() dto: UpdateCartQuantityDto,
  ) {
    return this.cartService.updateQuantity(user.userId, itemId, dto.quantity);
  }

  @Delete('items/:id')
  removeItem(@CurrentUser() user: Express.User, @Param('id') itemId: string) {
    return this.cartService.removeItem(user.userId, itemId);
  }

  @Delete()
  clearCart(@CurrentUser() user: Express.User) {
    return this.cartService.clearCart(user.userId);
  }

  @Post('checkout')
  checkout(@CurrentUser() user: Express.User, @Body() dto: CheckoutDto) {
    return this.cartService.createFromCart(user.userId, dto);
  }
}
