import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';
import { UpdateOrderStatusDto } from './dto/update-order.dto';
import { CurrentUser, Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'generated/prisma/enums';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GuestSession } from 'src/guest-session/decorators/guestSession';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrderService) {}
  @Post()
  @ApiOperation({
    summary: 'Создать заказ',
    description:
      'Создает заказ на основе элементов корзины. Заказ может быть создан как авторизованным пользователем, так и гостем.',
  })
  create(
    @CurrentUser() user: Express.User | undefined,
    @Body() dto: CreateOrderDto,
    @GuestSession() guestSessionId: string | undefined,
  ) {
    return this.ordersService.create(user?.userId, guestSessionId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить список заказов пользователя',
    description: 'Возвращает все заказы, связанные с текущим пользователем',
  })
  findAll(
    @CurrentUser() user: Express.User,
    @GuestSession() guestSessionId: string | undefined,
  ) {
    return this.ordersService.findAllOrders(user?.userId, guestSessionId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить информацию о заказе',
    description: 'Возвращает информацию о конкретном заказе пользователя',
  })
  findOne(
    @CurrentUser() user: Express.User,
    @Param('id', ParseIntPipe) id: number,
    @GuestSession() guestSessionId: string | undefined,
  ) {
    return this.ordersService.findOne(id, user?.userId, guestSessionId);
  }

  @ApiBearerAuth()
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Обновить статус заказа',
    description: 'Позволяет администратору обновить статус заказа',
  })
  @Roles(Role.ADMIN)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: Express.User,
  ) {
    return this.ordersService.updateStatus(id, dto.status, user.userId);
  }
}
