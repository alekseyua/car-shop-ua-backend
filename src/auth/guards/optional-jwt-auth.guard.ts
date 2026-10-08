import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(
    err: any,
    user: TUser,
    _info: any,
    _context: ExecutionContext,
  ): TUser | undefined {
    if (err) {
      return undefined;
    }

    return user;
  }
}
