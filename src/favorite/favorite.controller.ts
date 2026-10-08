import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { FavoriteService } from './favorite.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { CurrentUser } from 'src/auth/decorators/roles.decorator';
import { GuestSession } from 'src/guest-session/decorators/guestSession';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';

@Controller('favorites')
@UseGuards(OptionalJwtAuthGuard)
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  /**
   * Получить избранное.
   *
   * Авторизованный:
   *   userId
   *
   * Гость:
   *   guestSessionId
   */
  @Get()
  findAll(
    @CurrentUser() user: Express.User | undefined,
    @GuestSession() guestSessionId: string | undefined,
  ) {
    return this.favoriteService.findAll(user?.userId, guestSessionId);
  }

  /**
   * Добавить товар в избранное.
   */
  @Post()
  create(
    @CurrentUser() user: Express.User | undefined,
    @GuestSession() guestSessionId: string | undefined,
    @Body() dto: CreateFavoriteDto,
  ) {
    return this.favoriteService.create(
      user?.userId,
      guestSessionId,
      dto.itemNo,
    );
  }

  /**
   * Удалить товар из избранного.
   */
  @Delete(':itemNo')
  remove(
    @CurrentUser() user: Express.User | undefined,
    @GuestSession() guestSessionId: string | undefined,
    @Param('itemNo') itemNo: string,
  ) {
    return this.favoriteService.remove(user?.userId, guestSessionId, itemNo);
  }

  /**
   * Проверить, находится ли товар в избранном.
   */
  @Get('check/:itemNo')
  isFavorite(
    @CurrentUser() user: Express.User | undefined,
    @GuestSession() guestSessionId: string | undefined,
    @Param('itemNo') itemNo: string,
  ) {
    return this.favoriteService.isFavorite(
      user?.userId,
      guestSessionId,
      itemNo,
    );
  }

  /**
   * Перенести guest favorites
   * в favorites авторизованного пользователя.
   */
  @Post('merge')
  merge(
    @CurrentUser() user: Express.User | undefined,
    @GuestSession() guestSessionId: string | undefined,
  ) {
    return this.favoriteService.mergeGuestFavorites(
      user?.userId,
      guestSessionId,
    );
  }
}
