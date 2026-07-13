import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { GarageCarService } from './garage-car.service';
import { CreateGarageCarDto } from './dto/create-garage-car.dto';
import { UpdateGarageCarDto } from './dto/update-garage-car.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/roles.decorator';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('garage-car')
export class GarageCarController {
  constructor(private readonly garageCarService: GarageCarService) {}

  @ApiOperation({
    summary: 'Create car in the garage'
  })
  @Post()
  create(
    @CurrentUser() user: Express.User,
    @Body() createGarageCarDto: CreateGarageCarDto) {
    return this.garageCarService.create(user.userId,  createGarageCarDto);
  }

  @Get()
  findAll(
    @CurrentUser() user: Express.User,
  ) {
    
    return this.garageCarService.findAll(user.userId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: Express.User,
    @Param('id') id: string) {
    return this.garageCarService.findOne(user.userId, +id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: Express.User,
    @Param('id') id: string,
    @Body() updateGarageCarDto: UpdateGarageCarDto,
  ) {
    return this.garageCarService.update(user.userId, +id, updateGarageCarDto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: Express.User,
    @Param('id') id: string
  ) {
    return this.garageCarService.remove(user.userId, +id);
  }
}
