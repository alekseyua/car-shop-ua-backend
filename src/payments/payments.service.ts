import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderStatus, PaymentStatus } from 'generated/prisma/client';
import { randomUUID } from 'node:crypto';

import { PrismaService } from 'src/core/prisma/prisma.service';
import { LiqPayService } from './liqpay.service';
import { TelegramService } from 'src/telegram/telegram.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly liqpay: LiqPayService,
    private readonly config: ConfigService,
    private readonly telegramService: TelegramService,
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
    // const backendUrl = this.config.getOrThrow<string>('LIQPAY_BACKEND_URL');
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

    const backendUrl = this.config.getOrThrow<string>('LIQPAY_BACKEND_URL');

    return this.liqpay.createCheckout({
      orderId: payment.providerOrderId,
      amount: payment.amount.toFixed(2),
      currency: payment.currency,
      description: `Payment for order ${order.orderNumber}`,
      resultUrl: `${frontendUrl}/profile`,
      serverUrl: `${backendUrl}/api/payments/webhook`,
    });
  }

  async handleWebhook(data: string, signature: string) {
    const signatureValid = this.liqpay.verifySignature(data, signature);

    if (!signatureValid) {
      this.logger.warn('LiqPay webhook signature verification failed');

      throw new BadRequestException('Invalid LiqPay signature');
    }

    const payload = this.liqpay.decodeCallback(data);
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
      if (status === 'failure' || status === 'error') {
        const failedPayment = await this.prisma.payment.updateMany({
          where: {
            id: payment.id,
            status: PaymentStatus.PENDING,
          },
          data: {
            status: PaymentStatus.FAILED,
            providerStatus: status,
          },
        });

        // Уведомляем только при первом переходе в FAILED.
        if (failedPayment.count === 1) {
          try {
            const order = await this.prisma.order.findUnique({
              where: { id: payment.orderId },
              include: { items: true },
            });

            if (order) {
              await this.telegramService.sendOrderPaymentFailedNotification({
                orderId: order.id,
                customerName:
                  `${order.deliveryLastname} ${order.deliveryFirstname}`.trim(),
                phone: order.deliveryPhone,
                amount: Number(payment.amount),
                currency: payment.currency,
                reason: status,
                providerOrderId: payment.providerOrderId,
                errorDescription:
                  typeof payload.err_description === 'string'
                    ? payload.err_description
                    : undefined,
              });
            }
          } catch (error) {
            this.logger.error(
              `Failed payment notification failed: orderId=${payment.orderId}`,
              error instanceof Error ? error.stack : String(error),
            );
          }
        }
      } else if (status === 'reversed') {
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
    if (result.orderUpdated) {
      try {
        const order = await this.prisma.order.findUnique({
          where: { id: payment.orderId },
          include: {
            items: true,
          },
        });

        if (!order) {
          this.logger.error(
            `Order not found after payment: orderId=${payment.orderId}`,
          );
        } else {
          await this.telegramService.sendOrderPaidNotification({
            id: order.id,
            customerName:
              `${order.deliveryLastname} ${order.deliveryFirstname} ` +
              `(${order.userId ?? `Незареєстрований ${order.guestSessionId}`})`,
            phone: order.deliveryPhone,
            items: order.items.map((item) => ({
              name: item.title,
              itemNo: item.itemNo,
              quantity: item.quantity,
              price: Number(item.price),
            })),
            total: Number(order.totalPrice),
            delivery: [
              order.deliveryCity,
              order.deliveryStreet,
              order.deliveryHouse,
              order.deliveryApartment,
              order.deliveryPoint,
            ]
              .filter((value) => value != null && String(value).trim() !== '')
              .join(', '),
          });
        }
      } catch (error) {
        this.logger.error(
          `Paid order notification failed: orderId=${payment.orderId}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
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
