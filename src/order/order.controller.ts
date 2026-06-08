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
import { Roles } from 'src/auth/decorators/roles.decorator';
import { OrderStatus, Role } from 'generated/prisma/enums';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrderService) { }

  @Post()
  create(
    @Req() req,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(
      req.user.id,
      dto,
    );
  }

  @Get()
  findAll(@Req() req) {
    return this.ordersService.findAll(
      req.user.id,
    );
  }

  @Get(':id')
  findOne(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.findOne(
      id,
      req.user.id,
    );
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
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