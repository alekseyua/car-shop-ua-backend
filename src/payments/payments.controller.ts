import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { PaymentsService } from './payments.service';
import { CurrentUser } from 'src/auth/decorators/roles.decorator';
import { GuestSession } from 'src/guest-session/decorators/guestSession';
import { CreatePaymentDto } from './dto/request-payment.dto';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get(':paymentId/checkout')
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  getCheckout(
    @CurrentUser() user: Express.User | undefined,
    @GuestSession() guestSessionId: string | undefined,
    @Param('paymentId', ParseIntPipe) paymentId: number,
  ) {
    return this.paymentsService.getCheckout({
      paymentId,
      userId: user?.userId,
      guestSessionId: guestSessionId ?? undefined,
    });
  }

  @Post('checkout')
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  create(
    @CurrentUser() user: Express.User | undefined,
    @GuestSession() guestSessionId: string | undefined,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.createCheckout({
      orderId: dto.orderId,
      userId: user?.userId,
      guestSessionId: guestSessionId ?? undefined,
    });
  }

  @Post('webhook')
  @HttpCode(200)
  webhook(@Body() body: { data?: string; signature?: string }) {
    if (typeof body?.data !== 'string' || typeof body?.signature !== 'string') {
      this.logger.error('LiqPay webhook: invalid request body');
      throw new BadRequestException('Invalid webhook body');
    }
    return this.paymentsService.handleWebhook(body.data, body.signature);
  }

  @Get('order-status')
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  getOrderStatus(
    @CurrentUser() user: Express.User | undefined,
    @GuestSession() guestSessionId: string | undefined,
    @Query('orderId', ParseIntPipe) orderId: number,
  ) {
    return this.paymentsService.getOrderPaymentStatus({
      userId: user?.userId,
      guestSessionId: guestSessionId ?? undefined,
      orderId,
    });
  }
}
