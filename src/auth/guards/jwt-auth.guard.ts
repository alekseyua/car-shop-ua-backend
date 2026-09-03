import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'generated/prisma/client';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = User | null>(
    err: unknown,
    user: TUser | null,
    info: unknown,
  ) {
    console.log({ info });
    // Если токена нет или пользователь не авторизован —
    // не бросаем ошибку
    return user || null;
  }
}
