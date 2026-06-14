import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { RegisterDto } from './dto/registration-auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login-auth.dto';
import { generateNickname } from 'src/shared/common/helpers/helpers';

@Injectable()
export class AuthService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,

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
        birthDate: dto.birthDate
          ? new Date(dto.birthDate)
          : null,

        nickname: dto?.nickname ?? await generateNickname(),
        email: dto.email,
        phone: dto.phone,

        passwordHash,
      },
    });
    const tokens = await this.generateTokens(
      user.id,
      user.email,
    );

    const hash = await bcrypt.hash(
      tokens.refreshToken,
      10,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokenHash: hash,
      },
    });

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

    const isMatch = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Invalid password');
    }
    const tokens = await this.generateTokens(user.id, user.email);
    const hash = await bcrypt.hash(
      tokens.refreshToken,
      10,
    );

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshTokenHash: hash,
      },
    });

    return {...tokens, user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
    }};
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: process.env.JWT_REFRESH_SECRET,
        },
      );

      const user = await this.prisma.user.findUnique({
      where: {
          id: payload.sub,
        },
      });

      if (!user?.refreshTokenHash) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isMatch = await bcrypt.compare(
        refreshToken,
        user.refreshTokenHash,
      );

      if (!isMatch) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(
        user.id,
        user.email,
      );
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: number) {
    await this.prisma.user.update({
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
        secret: process.env.JWT_SECRET,
        expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES),
      }),

      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES),
      }),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
