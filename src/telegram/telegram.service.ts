import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface OrderItem {
  name: string;
  itemNo: string;
  quantity: number;
  price: number;
}

interface OrderNotification {
  id: number | string;
  customerName: string;
  phone: string;
  items: OrderItem[];
  total: number;
  delivery?: string;
}

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  constructor(private readonly configService: ConfigService) {}

  private get token(): string {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      throw new InternalServerErrorException(
        'TELEGRAM_BOT_TOKEN is not configured',
      );
    }

    return token;
  }

  private get chatIds(): number[] {
    const chatIds = this.configService.get<string>('TELEGRAM_CHAT_ID');
    if (!chatIds) {
      throw new InternalServerErrorException(
        'TELEGRAM_CHAT_ID is not configured',
      );
    }
    const chatIdsArr = chatIds
      .split(',')
      .map((id) => Number(id.trim()))
      .filter((id) => Number.isSafeInteger(id) && id !== 0);
    if (!chatIdsArr?.length) {
      throw new InternalServerErrorException(
        'TELEGRAM_CHAT_ID is not configured',
      );
    }
    return chatIdsArr;
  }

  private escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (char) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };

      return entities[char];
    });
  }

  private formatPrice(value: number): string {
    return value.toLocaleString('uk-UA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private async sendMessage(message: string): Promise<void> {
    const token = this.token;
    const chatIds = this.chatIds;

    if (!token || !chatIds?.length) {
      throw new InternalServerErrorException(
        'Telegram configuration is missing',
      );
    }

    for (const chatId of chatIds) {
      const response = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
          }),
        },
      );

      const result = await response.json().catch(() => null);

      if (!response.ok || result?.ok !== true) {
        this.logger.error(
          `Telegram API error: chatId=${chatId}, ` +
            `status=${response.status}, response=${JSON.stringify(result)}`,
        );

        throw new Error('Failed to send Telegram notification');
      }
    }
  }

  checkConfigTelegram() {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    const chatIds = this.configService.get<string>('TELEGRAM_CHAT_ID');

    console.log({ token, chatIds });
  }

  async sendOrderNotification(order: OrderNotification): Promise<void> {
    const items = order.items
      .map((item, index) => {
        const name = this.escapeHtml(item.name);
        const itemNo = this.escapeHtml(String(item.itemNo ?? '—'));
        const quantity = item.quantity;
        const price = this.formatPrice(item.price);
        const subtotal = this.formatPrice(item.price * quantity);

        return [
          `<b>${index + 1}. ${name}</b>`,
          `   Артикул: <code>${itemNo}</code>`,
          `   ${quantity} шт. × ${price} грн = <b>${subtotal} грн</b>`,
        ].join('\n');
      })
      .join('\n\n');

    const message = [
      '🛒 <b>НОВЫЙ ЗАКАЗ</b>',
      `🧾 Номер: <b>#${this.escapeHtml(String(order.id))}</b>`,
      '',
      '━━━━━━━━━━━━━━━━━━',
      '👤 <b>ПОКУПАТЕЛЬ</b>',
      this.escapeHtml(order.customerName),
      `📞 <code> ${this.escapeHtml(order.phone)}</code>`,
      '',
      '━━━━━━━━━━━━━━━━━━',
      `📦 <b>ТОВАРЫ · ${order.items.length} поз.</b>`,
      '',
      items || 'Нет товаров',
      '',
      '━━━━━━━━━━━━━━━━━━',
      `💰 <b>ИТОГО: ${this.formatPrice(order.total)} грн</b>`,
      '',
      '━━━━━━━━━━━━━━━━━━',
      '🚚 <b>ДОСТАВКА</b>',
      this.escapeHtml(order.delivery || 'Не указана'),
    ].join('\n');

    await this.sendMessage(message);
  }

  async sendOrderPaidNotification(order: OrderNotification): Promise<void> {
    const items = order.items
      .map((item, index) => {
        const name = this.escapeHtml(item.name);
        const itemNo = this.escapeHtml(String(item.itemNo ?? '—'));
        const quantity = item.quantity;
        const price = this.formatPrice(item.price);
        const subtotal = this.formatPrice(item.price * quantity);

        return [
          `<b>${index + 1}. ${name}</b>`,
          `   Артикул: <code>${itemNo}</code>`,
          `   ${quantity} шт. × ${price} грн = <b>${subtotal} грн</b>`,
        ].join('\n');
      })
      .join('\n\n');

    const message = [
      '✅ <b>ЗАКАЗ ОПЛАЧЕН</b>',
      `🧾 Заказ: <b>#${this.escapeHtml(String(order.id))}</b>`,
      '',
      '━━━━━━━━━━━━━━━━━━',
      '👤 <b>ПОКУПАТЕЛЬ</b>',
      this.escapeHtml(order.customerName),
      `📞 <code> ${this.escapeHtml(order.phone)} </code>`,
      '',
      '━━━━━━━━━━━━━━━━━━',
      `📦 <b>ТОВАРЫ · ${order.items.length} поз.</b>`,
      '',
      items || 'Нет товаров',
      '',
      '━━━━━━━━━━━━━━━━━━',
      `💰 <b>ИТОГО ОПЛАЧЕНО: ${this.formatPrice(order.total)} грн</b>`,
      '',
      '━━━━━━━━━━━━━━━━━━',
      '🚚 <b>ДОСТАВКА</b>',
      this.escapeHtml(order.delivery || 'Не указана'),
    ].join('\n');

    await this.sendMessage(message);
  }

  async sendOrderPaymentFailedNotification(params: {
    orderId: number;
    customerName: string;
    phone: string;
    amount: number;
    currency: string;
    reason: string;
    providerOrderId: string;
    errorDescription?: string;
  }): Promise<void> {
    const {
      orderId,
      customerName,
      phone,
      amount,
      currency,
      reason,
      providerOrderId,
      errorDescription,
    } = params;

    const message = [
      '❌ <b>НЕУСПЕШНАЯ ОПЛАТА</b>',
      '',
      `🛒 Заказ: <b>#${this.escapeHtml(String(orderId))}</b>`,
      '',
      '━━━━━━━━━━━━━━━━━━',
      '👤 <b>ПОКУПАТЕЛЬ</b>',
      this.escapeHtml(customerName || 'Не указано'),
      `📞 <code>${this.escapeHtml(phone || 'Не указан')}</code>`,
      '',
      '━━━━━━━━━━━━━━━━━━',
      `💰 Сумма: <b>${this.formatPrice(amount)} ${this.escapeHtml(currency)}</b>`,
      `📌 Статус LiqPay: <code>${this.escapeHtml(reason)}</code>`,
      `🆔 Платёж: <code>${this.escapeHtml(providerOrderId)}</code>`,
      errorDescription?.trim()
        ? `⚠️ Причина: ${this.escapeHtml(errorDescription.trim())}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    await this.sendMessage(message);
  }
}
