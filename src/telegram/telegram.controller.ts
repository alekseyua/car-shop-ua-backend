import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseGuards,
  Headers,
  Logger,
} from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { CurrentUser } from 'src/auth/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { GuestSession } from 'src/guest-session/decorators/guestSession';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiBearerAuth()
@Controller('telegram')
export class TelegramController {
  logger = new Logger(TelegramController.name);
  constructor(
    private readonly telegramService: TelegramService,
    private readonly configService: ConfigService,

    // private readonly parserServiceKroonOil: ParserServiceKroonOil,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('link')
  async createTelegramLink(@CurrentUser() user: Express.User) {
    this.logger.log({ user });
    const token = await this.telegramService.createLinkToken(user.userId);

    return {
      url: `https://t.me/car_spare_bot?start=${token}`,
    };
  }

  @Post('webhook')
  async webhook(
    @Body() update: any,
    @Headers('x-telegram-bot-api-secret-token') secret: string,
  ) {
    const expectedSecret = this.configService.get<string>(
      'TELEGRAM_WEBHOOK_SECRET',
    );

    if (!expectedSecret || secret !== expectedSecret) {
      throw new UnauthorizedException();
    }

    await this.telegramService.handleUpdate(update);

    return { ok: true };
  }
}
