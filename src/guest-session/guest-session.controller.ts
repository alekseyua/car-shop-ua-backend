import { Controller, Get, Post, Res } from '@nestjs/common';
import { GuestSessionService } from './guest-session.service';
import { Request, Response } from 'express';
import { GuestSession } from './decorators/guestSession';
import { addCookiesGuestSession } from 'src/shared/common/helpers/auth.helper';

@Controller('guest-session')
export class GuestSessionController {
  constructor(private readonly guestSessionService: GuestSessionService) {}

  @Post()
  async create(
    @Res({ passthrough: true }) res: Response,
    @GuestSession() guestSessionId?: string,
  ) {
    // Если cookie уже есть — проверяем существующую сессию
    if (guestSessionId) {
      const session =
        await this.guestSessionService.findSessionById(guestSessionId);
      if (!session) return null;
      return {
        success: true,
        expiresAt: session.expiresAt,
      };
    }

    // Cookie нет или сессия уже истекла/удалена
    const session = await this.guestSessionService.create();

    addCookiesGuestSession(res, session.id);
    return {
      success: true,
      expiresAt: session.expiresAt,
    };
  }

  @Get()
  findSessionUserById(@GuestSession() guestSessionId: string | undefined) {
    if (!guestSessionId) {
      return null;
    }
    return this.guestSessionService.findSessionById(guestSessionId);
  }
}
