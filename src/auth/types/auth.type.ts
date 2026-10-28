import { Request, Response } from 'express';

export interface RequestWithCookies extends Request {
  cookies: Record<string, string>;
}

export interface GoogleProfile {
  googleId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
}

export interface JwtUser {
  userId: number;
  email: string;
}

export type AuthenticatedUser = JwtUser | GoogleProfile;
