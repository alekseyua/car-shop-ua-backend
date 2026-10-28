import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { RegisterDto } from './dto/registration-auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login-auth.dto';
import { generateNickname } from 'src/shared/common/helpers/helpers';
import { GoogleProfile } from './types/auth.type';
import { createHash, randomBytes } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        lastName: dto.lastName,
        firstName: dto.firstName,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : null,

        nickname: dto?.nickname ?? generateNickname(),
        email: dto.email,
        phone: dto.phone,

        passwordHash,
      },
    });
    const tokens = await this.generateTokens(user.id, user.email);

    const hash = await bcrypt.hash(tokens.refreshToken, 10);
    try {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          refreshTokenHash: hash,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'This Google account or email is already in use',
        );
      }

      throw error;
    }

    return tokens;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // const isMatch = await bcrypt.compare(dto.password, user.passwordHash);

    // if (!isMatch) {
    //   throw new UnauthorizedException('Invalid password');
    // }
    const tokens = await this.generateTokens(user.id, user.email);
    const hash = await bcrypt.hash(tokens.refreshToken, 10);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshTokenHash: hash,
      },
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  // async refresh(refreshToken: string) {
  //   try {
  //     const payload = await this.jwtService.verifyAsync(refreshToken, {
  //       secret: process.env.JWT_REFRESH_SECRET,
  //     });

  //     const user = await this.prisma.user.findUnique({
  //       where: {
  //         id: payload.sub,
  //       },
  //     });

  //     if (!user?.refreshTokenHash) {
  //       throw new UnauthorizedException('Invalid refresh token');
  //     }
  //     const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);
  //     if (!isMatch) {
  //       throw new UnauthorizedException('Invalid refresh token');
  //     }
  //     const tokens = await this.generateTokens(user.id, user.email);

  //     const hash = await bcrypt.hash(tokens.refreshToken, 10);

  //     await this.prisma.user.update({
  //       where: { id: user.id },
  //       data: { refreshTokenHash: hash },
  //     });

  //     return tokens;
  //     // return this.generateTokens(user.id, user.email);
  //   } catch (error) {
  //     throw new UnauthorizedException('Invalid refresh token');
  //   }
  // }

  async refresh(refreshToken: string) {
    let payload: { sub: number; email: string };

    // 1. Проверяем подпись и срок действия refresh JWT.
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (!Number.isInteger(payload.sub) || typeof payload.email !== 'string') {
      throw new UnauthorizedException('Invalid refresh token payload');
    }

    // 2. Находим пользователя.
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        isActive: true,
        refreshTokenHash: true,
      },
    });

    if (
      !user ||
      !user.isActive ||
      !user.refreshTokenHash ||
      user.email !== payload.email
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 3. Проверяем, что токен совпадает с текущим хешем в БД.
    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);

    if (!matches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 4. Генерируем новую пару токенов.
    const tokens = await this.generateTokens(user.id, user.email);

    // 5. Хешируем новый refresh-токен.
    const newRefreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);

    // 6. Атомарно заменяем старый хеш новым.
    // Только один параллельный запрос сможет выполнить ротацию.
    const updated = await this.prisma.user.updateMany({
      where: {
        id: user.id,
        refreshTokenHash: user.refreshTokenHash,
        isActive: true,
      },
      data: {
        refreshTokenHash: newRefreshTokenHash,
      },
    });

    if (updated.count !== 1) {
      throw new UnauthorizedException('Refresh token has already been used');
    }

    // 7. Контроллер установит новый refresh-токен в cookie.
    return tokens;
  }

  async logout(userId: number) {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshTokenHash: null,
      },
    });
  }

  private async generateTokens(id: number, email: string) {
    const payload = {
      sub: id,
      email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: Number(
          this.configService.getOrThrow<string>('ACCESS_TOKEN_EXPIRES'),
        ),
      }),

      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: Number(
          this.configService.getOrThrow<string>('REFRESH_TOKEN_EXPIRES'),
        ),
      }),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async googleLogin(profile: GoogleProfile) {
    if (!profile.emailVerified) {
      throw new UnauthorizedException('Google email is not verified');
    }

    let user = await this.prisma.user.findUnique({
      where: { googleId: profile.googleId },
    });

    if (!user) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: profile.email },
        select: {
          id: true,
          email: true,
          googleId: true,
          emailVerified: true,
        },
      });

      if (existingUser) {
        // Не связываем аккаунты автоматически:
        // сначала нужна отдельная процедура подтверждения владения.
        throw new ConflictException(
          'An account with this email already exists. Sign in and link Google from account settings.',
        );
      }

      user = await this.prisma.user.create({
        data: {
          googleId: profile.googleId,
          email: profile.email,
          emailVerified: true,
          firstName: profile.firstName,
          lastName: profile.lastName,
          avatarUrl: profile.avatarUrl,
          nickname: generateNickname(),
          lastLoginAt: new Date(),
          passwordHash: null,
        },
      });
    } else {
      if (!user.isActive) {
        throw new UnauthorizedException('Account is disabled');
      }

      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async linkGoogleAccount(userId: number, profile: GoogleProfile) {
    if (!profile.emailVerified) {
      throw new UnauthorizedException('Google email is not verified');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        googleId: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    if (user.googleId) {
      throw new ConflictException('A Google account is already linked');
    }

    const googleOwner = await this.prisma.user.findUnique({
      where: { googleId: profile.googleId },
      select: { id: true },
    });

    if (googleOwner && googleOwner.id !== userId) {
      throw new ConflictException(
        'This Google account is already linked to another user',
      );
    }

    const emailOwner = await this.prisma.user.findUnique({
      where: { email: profile.email },
      select: { id: true },
    });

    if (emailOwner && emailOwner.id !== userId) {
      throw new ConflictException('This email belongs to another account');
    }

    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: { googleId: profile.googleId },
        select: {
          id: true,
          email: true,
          googleId: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'This Google account or email is already in use',
        );
      }

      throw error;
    }
  }

  async createGoogleLinkUrl(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isActive: true,
        googleId: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    if (user.googleId) {
      throw new ConflictException('Google account is already linked');
    }

    const state = randomBytes(32).toString('hex');
    const stateHash = createHash('sha256').update(state).digest('hex');

    await this.prisma.googleLinkState.create({
      data: {
        stateHash,
        userId,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    const params = new URLSearchParams({
      client_id: this.configService.getOrThrow('GOOGLE_CLIENT_ID'),
      redirect_uri: this.configService.getOrThrow('GOOGLE_LINK_CALLBACK_URL'),
      response_type: 'code',
      scope: 'openid email profile',
      state,
      prompt: 'select_account',
    });

    return {
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
    };
  }

  async completeGoogleLink(code: string, state: string) {
    const stateHash = createHash('sha256').update(state).digest('hex');

    const userId: number = await this.prisma.$transaction(
      async (tx): Promise<number> => {
        const record = await tx.googleLinkState.findUnique({
          where: { stateHash },
        });

        if (!record || record.expiresAt <= new Date()) {
          throw new UnauthorizedException(
            'Invalid or expired Google link state',
          );
        }

        const consumed = await tx.googleLinkState.deleteMany({
          where: {
            id: record.id,
            stateHash,
            expiresAt: { gt: new Date() },
          },
        });

        if (consumed.count !== 1) {
          throw new UnauthorizedException(
            'Google link state has already been used',
          );
        }

        return record.userId;
      },
    );

    const client = new OAuth2Client(
      this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      this.configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.getOrThrow<string>('GOOGLE_LINK_CALLBACK_URL'),
    );

    const { tokens } = await client.getToken(code);

    if (!tokens.id_token) {
      throw new UnauthorizedException('Google did not return an ID token');
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
    });

    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
      throw new UnauthorizedException(
        'Google identity or verified email is missing',
      );
    }

    const googleId = payload.sub;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isActive: true,
        googleId: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    if (user.googleId) {
      throw new ConflictException('A Google account is already linked');
    }

    const googleOwner = await this.prisma.user.findUnique({
      where: { googleId },
      select: { id: true },
    });

    if (googleOwner) {
      throw new ConflictException(
        'This Google account is already linked to another user',
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { googleId },
    });

    return { success: true };
  }
}
