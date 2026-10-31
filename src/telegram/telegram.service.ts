import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { IoredisService } from 'src/core/ioredis/ioredis.service';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { TelegramLinkPayload } from 'src/types/telegram.types';

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
  constructor(
    private readonly configService: ConfigService,
    private readonly redis: IoredisService,
    private readonly prisma: PrismaService,
  ) {}

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

  async createLinkToken(
    userId: number,
    guestSessionId?: string,
  ): Promise<string> {
    const token = randomBytes(32).toString('hex');

    const payload = {
      userId,
      guestSessionId,
      createdAt: Date.now(),
    };

    await this.redis.setWithExpire(
      `telegram:link:${token}`,
      JSON.stringify(payload),
      600, // 10 минут
    );

    return token;
  }

  async consumeLinkToken(token: string): Promise<TelegramLinkPayload | null> {
    const key = `telegram:link:${token}`;

    const payload = await this.redis.get(key);

    if (!payload) {
      return null;
    }
    await this.redis.remove(key);
    return JSON.parse(payload);
  }

  // telegram bot

  async sendToChat(
    chatId: number,
    message: string,
    replyMarkup?: any,
  ): Promise<void> {
    const response = await fetch(
      `https://api.telegram.org/bot${this.token}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
          ...(replyMarkup && { reply_markup: replyMarkup }),
        }),
      },
    );

    const result = await response.json().catch(() => null);

    if (!response.ok || result?.ok !== true) {
      this.logger.error(`Telegram send error: ${JSON.stringify(result)}`);

      throw new Error('Failed to send Telegram message');
    }
  }

  async handleUpdate(update: any): Promise<void> {
    const message = update.message;

    if (!message?.text || !message?.chat?.id) {
      return;
    }

    const chatId = message.chat.id;
    const text = message.text.trim();

    if (text.startsWith('/start')) {
      const token = text.split(/\s+/)[1];

      if (token) {
        await this.handleStartToken(chatId, message.from, token);
        return;
      }

      await this.sendToChat(
        chatId,
        [
          '👋 <b>Добро пожаловать в Car Spare!</b>',
          '',
          'Я помогу тебе:',
          '📦 Узнать статус заказов',
          '👤 Управлять профилем',
          '💬 Связаться с менеджером',
          '',
          'Для привязки аккаунта сайта нажми кнопку Telegram в личном кабинете.',
        ].join('\n'),
        {
          keyboard: [
            [{ text: '📦 Мои заказы' }, { text: '👤 Мой профиль' }],
            [{ text: '💬 Связаться с менеджером' }],
          ],
          resize_keyboard: true,
        },
      );

      return;
    }

    if (text === '/profile' || text === '👤 Мой профиль') {
      await this.showProfile(chatId);
      return;
    }

    if (text === '/orders' || text === '📦 Мои заказы') {
      await this.showOrders(chatId);
      return;
    }

    if (text === '/unlink') {
      await this.unlinkTelegramAccount(chatId);
      return;
    }
    if (text === '/help' || text === 'Помощь') {
      await this.sendToChat(
        chatId,
        [
          '<b>Доступные команды:</b>',
          '/start — начать работу',
          '/profile — мой профиль',
          '/orders — мои заказы',
          '/help — помощь',
        ].join('\n'),
      );

      return;
    }

    if (text === '/profile' || text === '👤 Мой профиль') {
      await this.sendToChat(
        chatId,
        'Для просмотра профиля сначала привяжи аккаунт сайта.',
      );

      return;
    }

    if (text === '/orders' || text === '📦 Мои заказы') {
      await this.sendToChat(
        chatId,
        'Для просмотра заказов сначала привяжи аккаунт сайта.',
      );

      return;
    }

    if (text === '💬 Связаться с менеджером') {
      await this.sendToChat(
        chatId,
        'Напиши своё сообщение, и мы передадим его менеджеру.',
      );

      return;
    }

    await this.sendToChat(
      chatId,
      'Я пока не понимаю эту команду. Напиши /help, чтобы посмотреть возможности.',
    );
  }

  async handleStartToken(
    chatId: number,
    from: any,
    token: string,
  ): Promise<void> {
    const payload: TelegramLinkPayload | null = await this.consumeLinkToken(token);

    if (!payload) {
      await this.sendToChat(
        chatId,
        '❌ Ссылка недействительна или устарела. Создай новую ссылку на сайте.',
      );

      return;
    }

    // Здесь сохраняем Telegram-пользователя в базе.
    await this.linkTelegramAccount({
      userId: payload.userId,
      guestSessionId: payload.guestSessionId,
      telegramId: from.id,
      username: from.username,
      firstName: from.first_name,
      lastName: from.last_name,
      chatId,
    });

    await this.sendToChat(
      chatId,
      [
        '✅ <b>Аккаунт успешно привязан!</b>',
        '',
        `Привет, ${this.escapeHtml(from.first_name || 'пользователь')}!`,
        'Теперь ты сможешь получать информацию о своих заказах.',
      ].join('\n'),
    );
  }

  async linkTelegramAccount(params: {
    userId: number;
    telegramId: number;
    guestSessionId?: string;
    chatId: number;
    username?: string;
    firstName?: string;
    lastName?: string;
  }) {
    const { userId, telegramId, chatId, username, firstName, lastName } =
      params;

    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { telegramId: String(telegramId) },
          { telegramChatId: String(chatId) },
        ],
        NOT: { id: userId },
      },
    });

    if (existing) {
      throw new Error('Этот Telegram уже привязан к другому аккаунту');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        telegramId: String(telegramId),
        telegramChatId: String(chatId),
        telegramUsername: username,
        telegramFirstName: firstName,
        telegramLastName: lastName,
        telegramLinkedAt: new Date(),
      },
    });
  }

  async getTelegramProfile(chatId: number) {
    return this.prisma.user.findUnique({
      where: {
        telegramChatId: String(chatId),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        nickname: true,
        email: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
        telegramUsername: true,
      },
    });
  }

  async getTelegramOrders(chatId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        telegramChatId: String(chatId),
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return null;
    }

    return this.prisma.order.findMany({
      where: {
        userId: user.id,
      },
      include: {
        items: true,
        payments: {
          select: {
            status: true,
            amount: true,
            paidAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });
  }

  private getOrderStatus(status: string): string {
    const statuses: Record<string, string> = {
      PENDING: '⏳ Ожидает оплаты',
      PAID: '✅ Оплачен',
      PROCESSING: '📦 Обрабатывается',
      SHIPPED: '🚚 Отправлен',
      DELIVERED: '🏁 Доставлен',
      CANCELLED: '❌ Отменён',
    };

    return statuses[status] || status;
  }

  async showProfile(chatId: number) {
    const user = await this.getTelegramProfile(chatId);

    if (!user) {
      await this.sendToChat(
        chatId,
        '❌ Аккаунт не привязан. Сначала привяжи его на сайте.',
      );
      return;
    }

    const message = [
      '👤 <b>МОЙ ПРОФИЛЬ</b>',
      '',
      `🆔 ID: <code>${user.id}</code>`,
      `👤 Имя: ${this.escapeHtml(
        [user.firstName, user.lastName].filter(Boolean).join(' ') ||
          'Не указано',
      )}`,
      `📧 Email: ${this.escapeHtml(user.email)}`,
      `📞 Телефон: ${this.escapeHtml(user.phone || 'Не указан')}`,
      `🔗 Telegram: @${this.escapeHtml(user.telegramUsername || 'Не указан')}`,
      '',
      `📅 Регистрация: ${user.createdAt.toLocaleDateString('uk-UA')}`,
    ].join('\n');

    await this.sendToChat(chatId, message);
  }

  async showOrders(chatId: number) {
    const orders = await this.getTelegramOrders(chatId);

    if (!orders) {
      await this.sendToChat(chatId, '❌ Сначала привяжи аккаунт.');
      return;
    }

    if (!orders.length) {
      await this.sendToChat(chatId, '📦 У тебя пока нет заказов.');
      return;
    }

    for (const order of orders) {
      const items = order.items.map((item, index) => {
        return [
          `${index + 1}. ${this.escapeHtml(item.title)}`,
          `   Артикул: <code>${this.escapeHtml(item.itemNo)}</code>`,
          `   Количество: ${item.quantity}`,
        ].join('\n');
      });

      const message = [
        `🛒 <b>ЗАКАЗ #${this.escapeHtml(order.orderNumber)}</b>`,
        '',
        `📌 Статус: ${this.getOrderStatus(order.status)}`,
        `💰 Сумма: ${this.formatPrice(Number(order.totalPrice))} ${order.currency}`,
        `📅 Дата: ${order.createdAt.toLocaleDateString('uk-UA')}`,
        '',
        '📦 <b>ТОВАРЫ</b>',
        '',
        ...items,
      ].join('\n');

      await this.sendToChat(chatId, message);
    }
  }
  async unlinkTelegramAccount(chatId: number) {
    await this.prisma.user.updateMany({
      where: {
        telegramChatId: String(chatId),
      },
      data: {
        telegramId: null,
        telegramChatId: null,
        telegramUsername: null,
        telegramFirstName: null,
        telegramLastName: null,
        telegramLinkedAt: null,
      },
    });

    await this.sendToChat(chatId, '✅ Telegram отвязан от аккаунта.');
  }
}
