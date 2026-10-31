import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { GuestSessionService } from '../guest-session.service';
import { addCookiesGuestSession } from 'src/shared/common/helpers/auth.helper';

@Injectable()
export class GuestSessionMiddleware implements NestMiddleware {
  logger = new Logger(GuestSessionMiddleware.name);
  constructor(private readonly guestSessionService: GuestSessionService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const isMergeRequest =
        req.method === 'POST' &&
        req.originalUrl.split('?')[0] === '/api/cart/merge';
      this.logger.log({ url: req.originalUrl, isMergeRequest });
      // Авторизованный пользователь:
      // гостевая сессия нужна только для merge
      if (req.user && !isMergeRequest) {
        return next();
      }

      const guestSessionId = req.cookies?.guest_session_id;
      console.log('middleware ', { user: req.user, guestSessionId });
      if (typeof guestSessionId === 'string' && guestSessionId.length > 0) {
        const session =
          await this.guestSessionService.findSessionById(guestSessionId);

        if (session) {
          req.guest_session_id = session.id;
          return next();
        }
      }

      // Для авторизованного пользователя не создаём новую сессию
      if (req.user) {
        return next();
      }

      // Для гостя создаём новую сессию
      const session = await this.guestSessionService.create();

      req.guest_session_id = session.id;

      addCookiesGuestSession(res, session.id);

      return next();
    } catch (error) {
      return next(error);
    }
  }
}
