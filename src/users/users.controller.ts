import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/roles.decorator';
import { clearCookiesGuestSession } from 'src/shared/common/helpers/auth.helper';
import { Response } from 'express';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async me(
    @CurrentUser() user: Express.User,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await this.usersService.getMe(user.userId);
    // if (response?.id) {
    //   clearCookiesGuestSession(res);
    // }
    return response;
  }

  @Patch('me')
  updateMe(@CurrentUser() user: Express.User, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(user.userId, dto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.usersService.getById(Number(id));
  }
}
