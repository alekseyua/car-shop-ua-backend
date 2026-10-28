import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { ConfigModule } from '@nestjs/config';
import { GoogleLinkStateCleanupService } from './google-link-state-cleanup.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'carShopSecretKey',
      signOptions: {
        expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES),
      },
    }),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    PrismaService,
    GoogleStrategy,
    GoogleLinkStateCleanupService,
  ],
  exports: [JwtStrategy, AuthService],
})
export class AuthModule {}
