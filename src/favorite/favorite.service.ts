import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/core/prisma/prisma.service';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';

@Injectable()
export class FavoriteService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Получить избранное пользователя или гостя.
   *
   * userId имеет приоритет.
   */
  async findAll(userId?: number, guestSessionId?: string) {
    if (userId) {
      return this.prisma.favorite.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    if (guestSessionId) {
      return this.prisma.favorite.findMany({
        where: {
          guestSessionId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return [];
  }

  /**
   * Добавить товар в избранное.
   *
   * Авторизованный пользователь:
   *   userId
   *
   * Гость:
   *   guestSessionId
   */
  async create(
    userId: number | undefined,
    guestSessionId: string | undefined,
    itemNo: string,
  ) {
    if (userId) {
      const exists = await this.prisma.favorite.findUnique({
        where: {
          userId_itemNo: {
            userId,
            itemNo,
          },
        },
      });

      if (exists) {
        return exists;
      }

      return this.prisma.favorite.create({
        data: {
          userId,
          itemNo,
        },
      });
    }

    if (guestSessionId) {
      const exists = await this.prisma.favorite.findUnique({
        where: {
          guestSessionId_itemNo: {
            guestSessionId,
            itemNo,
          },
        },
      });

      if (exists) {
        return exists;
      }

      return this.prisma.favorite.create({
        data: {
          guestSessionId,
          itemNo,
        },
      });
    }

    throw new BadRequestException('User or guest session is required');
  }

  /**
   * Проверить избранное.
   */
  async isFavorite(
    userId: number | undefined,
    guestSessionId: string | undefined,
    itemNo: string,
  ) {
    if (userId) {
      const favorite = await this.prisma.favorite.findUnique({
        where: {
          userId_itemNo: {
            userId,
            itemNo,
          },
        },
      });

      return {
        isFavorite: !!favorite,
      };
    }

    if (guestSessionId) {
      const favorite = await this.prisma.favorite.findUnique({
        where: {
          guestSessionId_itemNo: {
            guestSessionId,
            itemNo,
          },
        },
      });

      return {
        isFavorite: !!favorite,
      };
    }

    return {
      isFavorite: false,
    };
  }

  /**
   * Удалить из избранного.
   */
  async remove(
    userId: number | undefined,
    guestSessionId: string | undefined,
    itemNo: string,
  ) {
    if (userId) {
      await this.prisma.favorite.delete({
        where: {
          userId_itemNo: {
            userId,
            itemNo,
          },
        },
      });

      return {
        success: true,
      };
    }

    if (guestSessionId) {
      await this.prisma.favorite.delete({
        where: {
          guestSessionId_itemNo: {
            guestSessionId,
            itemNo,
          },
        },
      });

      return {
        success: true,
      };
    }

    throw new BadRequestException('User or guest session is required');
  }

  /**
   * Merge guest favorites → user favorites.
   *
   * Если товар уже есть у пользователя,
   * второй раз он не создаётся.
   */
  async mergeGuestFavorites(
    userId: number | undefined,
    guestSessionId: string | undefined,
  ) {
    if (!userId) {
      throw new BadRequestException('Authorization is required');
    }

    if (!guestSessionId) {
      return this.findAll(userId);
    }

    const guestFavorites = await this.prisma.favorite.findMany({
      where: {
        guestSessionId,
      },
    });

    /**
     * У гостя ничего нет.
     */
    if (guestFavorites.length === 0) {
      return this.findAll(userId);
    }

    await this.prisma.$transaction(async (tx) => {
      for (const favorite of guestFavorites) {
        const existing = await tx.favorite.findUnique({
          where: {
            userId_itemNo: {
              userId,
              itemNo: favorite.itemNo,
            },
          },
        });

        /**
         * Если уже есть —
         * ничего не делаем.
         */
        if (existing) {
          continue;
        }

        /**
         * Переносим guest favorite
         * пользователю.
         */
        await tx.favorite.create({
          data: {
            userId,
            itemNo: favorite.itemNo,
          },
        });
      }

      /**
       * После успешного merge
       * удаляем guest favorites.
       */
      await tx.favorite.deleteMany({
        where: {
          guestSessionId,
        },
      });
    });

    return this.findAll(userId);
  }

  findOne(id: number) {
    return `This action returns a #${id} favorite`;
  }

  update(id: number, updateFavoriteDto: UpdateFavoriteDto) {
    return `This action updates a #${id} favorite`;
  }
}
