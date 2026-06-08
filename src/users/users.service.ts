import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        lastName: true,
        firstName: true,
        birthDate: true,
        nickname: true,
        email: true,
        emailVerified: true,
        lastLoginAt: true,
        avatarUrl: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateMe(userId: number, dto: UpdateUserDto) {
    if (dto.nickname) {
      const exists = await this.prisma.user.findFirst({
        where: {
          nickname: dto.nickname,
          NOT: { id: userId },
        },
      });

      if (exists) {
        throw new ConflictException('Nickname already taken');
      }
    }

    if (dto.phone) {
      const exists = await this.prisma.user.findFirst({
        where: {
          phone: dto.phone,
          NOT: { id: userId },
        },
      });

      if (exists) {
        throw new ConflictException('Phone already taken');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        lastName: dto.lastName,
        firstName: dto.firstName,
        birthDate: dto.birthDate
          ? new Date(dto.birthDate)
          : undefined,
        nickname: dto.nickname,
        avatarUrl: dto.avatarUrl,
        phone: dto.phone,
      },
      select: {
        id: true,
        lastName: true,
        firstName: true,
        birthDate: true,
        nickname: true,
        email: true,
        avatarUrl: true,
        phone: true,
        role: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async getById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        lastName: true,
        firstName: true,
        nickname: true,
        email: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    });
  }
  
}
