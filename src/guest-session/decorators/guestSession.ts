import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GuestSession = createParamDecorator(
  (_data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return request.cookies?.guest_session_id;
  },
);
