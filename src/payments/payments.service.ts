import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderStatus, PaymentStatus } from 'generated/prisma/client';
import { randomUUID } from 'node:crypto';

import { PrismaService } from 'src/core/prisma/prisma.service';
import { LiqPayService } from './liqpay.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly liqpay: LiqPayService,
    private readonly config: ConfigService,
  ) {}

  async createCheckout(params: {
    orderId: number;
    userId?: number;
    guestSessionId?: string;
  }) {
    const { orderId, userId, guestSessionId } = params;

    // Должен быть установлен ровно один способ владения заказом.
    if (
      (userId == null && !guestSessionId) ||
      (userId != null && !!guestSessionId)
    ) {
      throw new ForbiddenException('Invalid order ownership context');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const ownsOrder =
      userId != null
        ? order.userId === userId
        : order.userId == null && order.guestSessionId === guestSessionId;

    if (!ownsOrder) {
      throw new ForbiddenException('Not your order');
    }

    if (order.status !== OrderStatus.PENDING || order.paidAt) {
      throw new BadRequestException('Order is not payable');
    }

    if (order.currency !== 'UAH') {
      throw new BadRequestException('Unsupported order currency');
    }

    const amount = order.totalPrice.toFixed(2);

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      throw new BadRequestException('Invalid order amount');
    }

    const providerOrderId = `liqpay_${randomUUID()}`;
    console.log({ providerOrderId, userId, ownsOrder });

    const payment = await this.prisma.payment.create({
      data: {
        orderId: order.id,
        providerOrderId,
        amount,
        currency: order.currency,
        status: PaymentStatus.PENDING,
      },
    });

    // const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');
    // const backendUrl = this.config.getOrThrow<string>('BACKEND_URL');
    return {
      paymentId: payment.id,
    };
    // return this.liqpay.createCheckout({
    //   orderId: payment.providerOrderId,
    //   amount: payment.amount.toFixed(2),
    //   currency: payment.currency,
    //   description: `Payment for order ${order.orderNumber}`,
    //   resultUrl:
    //     `${frontendUrl}/payment/result?orderNumber=` +
    //     encodeURIComponent(order.orderNumber),
    //   serverUrl: `${backendUrl}/payments/webhook`,
    // });
  }

  async getCheckout(params: {
    paymentId: number;
    userId?: number;
    guestSessionId?: string;
  }) {
    const { paymentId, userId, guestSessionId } = params;

    if (
      (userId == null && !guestSessionId) ||
      (userId != null && !!guestSessionId)
    ) {
      throw new ForbiddenException('Invalid order ownership context');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const order = payment.order;

    const ownsOrder =
      userId != null
        ? order.userId === userId
        : order.userId == null && order.guestSessionId === guestSessionId;

    if (!ownsOrder) {
      throw new ForbiddenException('Not your order');
    }

    if (
      payment.status !== PaymentStatus.PENDING ||
      order.status !== OrderStatus.PENDING ||
      order.paidAt
    ) {
      throw new BadRequestException('Payment is not payable');
    }

    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');

    const backendUrl = this.config.getOrThrow<string>('BACKEND_URL');

    return this.liqpay.createCheckout({
      orderId: payment.providerOrderId,
      amount: payment.amount.toFixed(2),
      currency: payment.currency,
      description: `Payment for order ${order.orderNumber}`,
      resultUrl: `${frontendUrl}/profile`,
      serverUrl: `${backendUrl}/payments/webhook`,
    });
  }

  async handleWebhook(data: string, signature: string) {
    if (!this.liqpay.verifySignature(data, signature)) {
      throw new BadRequestException('Invalid LiqPay signature');
    }

    const payload = this.liqpay.decodeCallback(data);
console.log('LiqPay webhook:', {
  status: payload.status,
  orderId: payload.order_id,
});
    if (!this.liqpay.isPublicKeyValid(payload.public_key)) {
      throw new BadRequestException('Invalid LiqPay public key');
    }

    const providerOrderId = payload.order_id;
    const status = payload.status;
    const amount = payload.amount;
    const currency = payload.currency;

    if (
      typeof providerOrderId !== 'string' ||
      typeof status !== 'string' ||
      (typeof amount !== 'string' && typeof amount !== 'number') ||
      typeof currency !== 'string'
    ) {
      throw new BadRequestException('Invalid LiqPay callback fields');
    }

    if (typeof amount === 'number' && !Number.isFinite(amount)) {
      throw new BadRequestException('Invalid callback amount');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { providerOrderId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Сумма в обеих моделях указана в гривнах.
    // Никакого деления на 100.
    const callbackAmount = Number(amount);

    if (
      !Number.isFinite(callbackAmount) ||
      callbackAmount <= 0 ||
      callbackAmount.toFixed(2) !== payment.amount.toFixed(2) ||
      currency !== payment.currency
    ) {
      throw new BadRequestException('Payment amount/currency mismatch');
    }
    const sandboxEnabled = this.config.get<string>('LIQPAY_SANDBOX') === 'true';
    const isSuccessful =
      status === 'success' || (status === 'sandbox' && sandboxEnabled);
    if (!isSuccessful) {
      // Не переводим уже успешный платёж обратно в FAILED.
      // Промежуточные статусы сохраняем, терминальные — обрабатываем отдельно.
      if (status === 'failure' || status === 'error') {
        await this.prisma.payment.updateMany({
          where: {
            id: payment.id,
            status: PaymentStatus.PENDING,
          },
          data: {
            status: PaymentStatus.FAILED,
            providerStatus: status,
          },
        });
      } else if (status === 'reversed') {
        // Обратная операция требует отдельной бизнес-логики:
        // заказ мог уже уйти в PROCESSING или SHIPPED.
        await this.prisma.payment.updateMany({
          where: {
            id: payment.id,
            status: PaymentStatus.SUCCEEDED,
          },
          data: {
            status: PaymentStatus.REVERSED,
            providerStatus: status,
          },
        });
      } else {
        await this.prisma.payment.updateMany({
          where: {
            id: payment.id,
            status: PaymentStatus.PENDING,
          },
          data: { providerStatus: status },
        });
      }

      return { received: true };
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.updateMany({
        where: {
          id: payment.id,
          status: PaymentStatus.PENDING,
        },
        data: {
          status: PaymentStatus.SUCCEEDED,
          providerStatus: status,
          paidAt: new Date(),
        },
      });

      if (updatedPayment.count === 0) {
        const current = await tx.payment.findUnique({
          where: { id: payment.id },
        });

        if (current?.status === PaymentStatus.SUCCEEDED) {
          return { duplicate: true, orderUpdated: false };
        }

        // Если платёж уже FAILED или REVERSED, успех нужно
        // расследовать, а не молча проигнорировать.
        throw new BadRequestException('Payment is not in a payable state');
      }

      const orderUpdate = await tx.order.updateMany({
        where: {
          id: payment.orderId,
          status: OrderStatus.PENDING,
          paidAt: null,
        },
        data: {
          status: OrderStatus.PAID,
          paidAt: new Date(),
        },
      });

      // Деньги могли прийти по второй попытке, когда заказ
      // уже оплачен другой попыткой или отменён.
      // Сохраняем успешный платёж и отмечаем конфликт.
      return {
        duplicate: false,
        orderUpdated: orderUpdate.count === 1,
      };
    });

    if (!result.orderUpdated && !result.duplicate) {
      // Добавь логирование/уведомление оператору:
      // деньги получены, но заказ не удалось перевести в PAID.
      // Не делай автоматический возврат без сверки.
    }

    return { received: true };
  }

  async getOrderPaymentStatus(params: {
    userId?: number;
    guestSessionId?: string;
    orderId: number;
  }) {
    const { userId, guestSessionId, orderId } = params;

    if (
      (userId == null && !guestSessionId) ||
      (userId != null && !!guestSessionId)
    ) {
      throw new ForbiddenException('Invalid order ownership context');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const ownsOrder =
      userId != null
        ? order.userId === userId
        : order.userId == null && order.guestSessionId === guestSessionId;

    if (!ownsOrder) {
      throw new ForbiddenException('Not your order');
    }

    return {
      orderStatus: order.status,
      paidAt: order.paidAt,
      latestPayment: order.payments[0] ?? null,
    };
  }
}
