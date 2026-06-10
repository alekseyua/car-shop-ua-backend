import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';

import { FavoriteService } from './favorite.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { CurrentUser } from 'src/auth/decorators/roles.decorator';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoriteController {
  constructor(
    private readonly favoriteService: FavoriteService,
  ) { }

  @Get()
  findAll(
        @CurrentUser() user: Express.User,
  ) {
    return this.favoriteService.findAll(
      user.id,
    );
  }

  @Post()
  create(
    @CurrentUser() user: Express.User,
    @Body() dto: CreateFavoriteDto,
  ) {
    return this.favoriteService.create(
      user.id,
      dto.productId,
    );
  }

  @Delete(':productId')
  remove(
    @CurrentUser() user: Express.User,
    @Param('productId')
    productId: string,
  ) {
    return this.favoriteService.remove(
      user.id,
      productId,
    );
  }

  @Get('check/:productId')
  isFavorite(
    @CurrentUser() user: Express.User,
    @Param('productId')
    productId: string,
  ) {
    return this.favoriteService.isFavorite(
      user.id,
      productId,
    );
  }
}