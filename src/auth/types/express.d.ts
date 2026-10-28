import { AuthenticatedUser } from './auth.type';

declare global {
  namespace Express {
    // Расширяем Express.User через module augmentation
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends AuthenticatedUser {}
  }
}

export {};
