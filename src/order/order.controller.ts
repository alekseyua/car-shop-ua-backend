import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';
import { UpdateOrderStatusDto } from './dto/update-order.dto';
import { CurrentUser, Roles } from 'src/auth/decorators/roles.decorator';
import { OrderStatus, Role } from 'generated/prisma/enums';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrderService) { }

  @Post()
  @ApiOperation({
    summary:'Создать заказ',
    description:'Создает заказ на основе элементов в корзине пользователя. В будущем планируется возможность выбора конкретных элементов для заказа.'
  })
  create(
    @CurrentUser() user: Express.User,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create( 
      user.userId,
      dto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Получить список заказов пользователя',
    description: 'Возвращает все заказы, связанные с текущим пользователем',
  })
  findAll(@CurrentUser() user: Express.User) {
    return this.ordersService.findAll(
      user.userId,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить информацию о заказе',
    description: 'Возвращает информацию о конкретном заказе пользователя',
  })
  findOne(
    @CurrentUser() user: Express.User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.findOne(
      id,
      user.userId,
    );
  }

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
    return this.ordersService.updateStatus(
      id,
      dto.status,
    );
  }

  // @Post('webhook')
  // async stripeWebhook(
  //   @Req() req: RawBodyRequest<Request>,
  //   @Headers('stripe-signature') sig: string,
  // ) {
  //   const event =
  //     this.stripeService.constructEvent(
  //       req.rawBody,
  //       sig,
  //     );

  //   if (
  //     event.type ===
  //     'checkout.session.completed'
  //   ) {
  //     const session = event.data.object;

  //     const orderId = Number(
  //       session.metadata.orderId,
  //     );

  //     await this.ordersService.updateStatus(
  //       orderId,
  //       OrderStatus.PAID,
  //     );
  //   }

  //   return { received: true };
  // }
}