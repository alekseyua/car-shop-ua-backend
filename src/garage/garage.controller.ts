import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { GarageService } from './garage.service';
import { CreateGarageDto } from './dto/create-garage.dto';
import { UpdateGarageDto } from './dto/update-garage.dto';
import { GarageResponseDto } from './dto/response-garage.dto';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/roles.decorator';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('garage')
export class GarageController {
  constructor(private readonly garageService: GarageService) {}

  @ApiOperation({
    summary: 'Create new garage',
    description: 'Create garage for current user',
  })
  @ApiOkResponse({
    type: GarageResponseDto,
  })
  @Post()
  create(
    @CurrentUser() user: Express.User,
    @Body() dto: CreateGarageDto,
  ): Promise<GarageResponseDto> {
    return this.garageService.create(user.userId, dto);
  }

  @ApiOperation({
    summary: 'Get all garages',
    description: "Return the current user's garages",
  })
  @ApiOkResponse({
    type: GarageResponseDto,
    isArray: true,
  })
  @Get()
  findAll(@CurrentUser() user: Express.User): Promise<GarageResponseDto[]> {
    return this.garageService.findAll(user.userId);
  }

  @ApiOperation({
    summary: 'Delete garage',
  })
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Express.User,
  ) {
    return this.garageService.remove(id, user.userId);
  }

  @ApiOperation({
    summary: 'Update garage',
  })
  @Put(':id')
  edit(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGarageDto,
    @CurrentUser() user: Express.User,
  ): Promise<GarageResponseDto> {
    return this.garageService.edit(id, user.userId, dto);
  }

  @ApiOperation({
    summary: 'Set default garage',
  })
  @Put(':id/default')
  setDefaultGarage(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Express.User,
  ): Promise<GarageResponseDto> {
    return this.garageService.setDefaultGarage(id, user.userId);
  }
}
