import { AuthenticatedUser } from './auth.type';

declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}
    interface Request {
      guest_session_id?: string;
    }
  }
}

export {};
