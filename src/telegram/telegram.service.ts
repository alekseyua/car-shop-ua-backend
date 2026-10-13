import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { adminConfig } from 'src/core/config/admin.config';

interface OrderItem {
  name: string;
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

  async sendOrderNotification(order: OrderNotification): Promise<void> {
    const token = adminConfig.telegram.TELEGRAM_BOT_TOKEN;
    const listChatId = adminConfig.telegram.TELEGRAM_CHAT_ID;
    console.log({ listChatId });
    if (!token || !listChatId.length) {
      throw new InternalServerErrorException(
        'Telegram configuration is missing',
      );
    }

    const items = order.items
      .map(
        (item) =>
          `• ${this.escapeHtml(item.name)} × ${item.quantity}` +
          ` — ${(item.price * item.quantity).toLocaleString('uk-UA')} грн`,
      )
      .join('\n');

    const message = [
      `🛒 <b>Новый заказ №${this.escapeHtml(String(order.id))}</b>`,
      '',
      `👤 Клиент: ${this.escapeHtml(order.customerName)}`,
      `📞 Телефон: ${this.escapeHtml(order.phone)}`,
      '',
      '<b>Товары:</b>',
      items,
      '',
      `💰 <b>Итого: ${order.total.toLocaleString('uk-UA')} грн</b>`,
      order.delivery ? `🚚 Доставка: ${this.escapeHtml(order.delivery)}` : '',
    ]
      .filter(Boolean)
      .join('\n');
    for (const userId of listChatId) {
      const response = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: userId,
            text: message,
            parse_mode: 'HTML',
          }),
        },
      );

      if (!response.ok) {
        this.logger.error(`Telegram API error: ${response.status}`);

        throw new Error('Failed to send Telegram notification');
      }
    }
  }
}
