import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { GarageService } from './garage.service';
import { CreateGarageDto } from './dto/create-garage.dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/roles.decorator';
import { GarageResponseDto } from './dto/response-garage.dto';
import { UpdateGarageDto } from './dto/update-garage.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('garage')
export class GarageController {
  constructor(private readonly garageService: GarageService) {}

  @ApiOperation({
    summary: 'Create new garage',
    description: 'return create garage',
  })
  @ApiOkResponse({
    type: GarageResponseDto,
  })
  @Post()
  create(
    @CurrentUser() user: Express.User,
    @Body() createGarageDto: CreateGarageDto,
  ): Promise<GarageResponseDto> {
    return this.garageService.create(user.userId, createGarageDto);
  }

  @ApiOperation({
    summary: 'Get all garages',
    description: "Return the current user's garages.",
  })
  @ApiOkResponse({
    type: GarageResponseDto,
  })
  @Get()
  findAll(@CurrentUser() user: Express.User): Promise<GarageResponseDto[]> {
    return this.garageService.findAll(user.userId);
  }

  @ApiOperation({
    summary: 'Delete item garage',
  })
  @ApiOkResponse({
    type: GarageResponseDto,
  })
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: Express.User) {
    return this.garageService.remove(+id, user.userId);
  }

  @ApiOperation({
    summary: 'Update item garage',
  })
  @ApiOkResponse({
    type: GarageResponseDto,
  })
  @Put(':id')
  edit(
    @Param('id') id: string,
    @Body() dto: UpdateGarageDto,
    @CurrentUser() user: Express.User,
  ) {
    return this.garageService.edit(+id, user.userId, dto);
  }

  @ApiOperation({
    summary: 'Set default garage',
  })
  @ApiOkResponse({
    type: GarageResponseDto,
  })
  @Put(':id/default')
  setDefaultGarage(@Param('id') id: string, @CurrentUser() user: Express.User) {
    return this.garageService.setDefaultGarage(+id, user.userId);
  }
}
