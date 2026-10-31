import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'generated/prisma/client';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = User | null>(
    err: any,
    user: TUser | null,
    _info: any,
    _context: ExecutionContext,
  ): TUser | null {
    if (err) {
      return null;
    }

    return user || null;
  }
}
