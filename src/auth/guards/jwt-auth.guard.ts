import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest();

        console.log('AUTH HEADER:', req.headers.authorization);

        return super.canActivate(context);
    }
 }