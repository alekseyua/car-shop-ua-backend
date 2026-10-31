import { Response } from 'express';

export const clearCookiesGuestSession = (res: Response) => {
  res.clearCookie('guest_session_id', {
    httpOnly: true,
    //       // secure: process.env.NODE_ENV === 'production',
    secure: true,
    // // sameSite: 'lax',
    sameSite: 'none',
    // path: '/auth',
  });
};

export const addCookiesGuestSession = (res: Response, id: string) => {
  res.cookie('guest_session_id', id, {
    httpOnly: true,
    // secure: process.env.NODE_ENV === 'production',
    secure: true,
    // sameSite: 'lax',
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    // path: '/',
  });
};
