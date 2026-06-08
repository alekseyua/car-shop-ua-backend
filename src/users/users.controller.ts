import { Controller, Get, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req) {
    return this.usersService.getMe(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@Req() req, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.usersService.getById(Number(id));
  }

}
