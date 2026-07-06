import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { GarageService } from './garage.service';
import { CreateGarageDto } from './dto/create-garage.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/roles.decorator';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('garage')
export class GarageController {
  constructor(private readonly garageService: GarageService) {}

  @Post()
  create(
    @CurrentUser() user: Express.User,
    @Body() createGarageDto: CreateGarageDto,
  ) {
    return this.garageService.create(user.userId, createGarageDto);
  }

  @Get()
  findAll(@CurrentUser() user: Express.User) {
    return this.garageService.findAll(user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: Express.User) {
    return this.garageService.remove(+id, user.userId);
  }
}
