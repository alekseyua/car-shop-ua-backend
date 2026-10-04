import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class GuestSessionService {
  constructor(private readonly prisma: PrismaService) {}

  async create() {
    return this.prisma.guestSession.create({
      data: {
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  async findSessionById(id: string | null) {
    if (!id) {
      return null;
    }

    const session = await this.prisma.guestSession.findUnique({
      where: {
        id,
      },
    });

    if (!session) {
      return null;
    }

    // Сессия протухла
    if (session.expiresAt < new Date()) {
      await this.prisma.guestSession.delete({
        where: {
          id: session.id,
        },
      });

      return null;
    }

    return session;
  }
}
