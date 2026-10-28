import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UnauthorizedException,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/registration-auth.dto';
import { LoginDto } from './dto/login-auth.dto';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { GoogleProfile, JwtUser, RequestWithCookies } from './types/auth.type';
import { CurrentUser } from './decorators/roles.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/api/auth',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }
  private clearRefreshCookie(res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/api/auth',
    });
  }

  @Post('register')
  @ApiOkResponse({
    description: 'User successfully registered',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
      },
    },
  })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    this.setRefreshCookie(res, result.refreshToken);
    const { refreshToken, ...response } = result;
    return response;
  }

  @Post('login')
  @ApiOkResponse({
    description: 'User successfully logged in',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            nickname: { type: 'string' },
            phone: { type: 'string' },
            avatarUrl: { type: 'string' },
          },
        },
      },
    },
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    this.setRefreshCookie(res, result.refreshToken);
    res.clearCookie('guest_session_id', {
      httpOnly: true,
      //       // secure: process.env.NODE_ENV === 'production',
      secure: true,
      // // sameSite: 'lax',
      sameSite: 'none',
      // path: '/auth',
    });
    const { refreshToken, ...response } = result;
    return response;
  }

  @Post('refresh')
  @ApiOkResponse({
    description: 'Tokens successfully refreshed',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
      },
    },
  })
  async refresh(
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const tokens = await this.authService.refresh(refreshToken);

    // Обновляем cookie при ротации refresh-токена.
    this.setRefreshCookie(res, tokens.refreshToken);
    return {
      accessToken: tokens.accessToken,
    };
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOkResponse({
    description: 'User successfully logged out',
  })
  async logout(
    // @Body('userId') userId: number,
    @CurrentUser() user: Express.User | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
    const response = await this.authService.logout(user.userId);
    this.clearRefreshCookie(res);
    return response;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req: Request & { user: GoogleProfile },
    @Res() res: Response,
  ) {
    const profile = req.user;

    if (!profile) {
      throw new UnauthorizedException('Google authentication failed');
    }

    const result = await this.authService.googleLogin(profile);
    this.setRefreshCookie(res, result.refreshToken);

    // return res.redirect(
    //   `${this.configService.getOrThrow('FRONTEND_URL')}`, ///auth/google/success
    // );
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

    return res.redirect(`${frontendUrl}/auth/google/success`);
  }

  @Post('google/link')
  @UseGuards(JwtAuthGuard)
  async startGoogleLink(@Req() req: Request & { user: JwtUser }) {
    return this.authService.createGoogleLinkUrl(req.user.userId);
  }

  @Get('google/link/callback')
  async googleLinkCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    if (!code || !state) {
      throw new UnauthorizedException(
        'Google authorization code or state is missing',
      );
    }

    await this.authService.completeGoogleLink(code, state);

    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

    return res.redirect(`${frontendUrl}/profile?googleLinked=success`);
  }
}
