import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/roles.decorator';

@Controller('address')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  /**
   * Создать адрес пользователя.
   */
  @Post()
  create(@CurrentUser() user: Express.User, @Body() dto: CreateAddressDto) {
    return this.addressService.create(user.userId, dto);
  }

  /**
   * Получить все адреса пользователя.
   */
  @Get()
  findAll(@CurrentUser() user: Express.User) {
    return this.addressService.findAll(user.userId);
  }

  /**
   * Получить конкретный адрес.
   */
  @Get(':id')
  findOne(
    @CurrentUser() user: Express.User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.addressService.findOne(user.userId, id);
  }

  /**
   * Сделать адрес основным.
   */
  @Patch(':id/default')
  setDefault(
    @CurrentUser() user: Express.User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.addressService.setDefault(user.userId, id);
  }

  /**
   * Обновить адрес.
   */
  @Patch(':id')
  update(
    @CurrentUser() user: Express.User,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressService.update(user.userId, id, dto);
  }

  /**
   * Удалить адрес.
   */
  @Delete(':id')
  remove(
    @CurrentUser() user: Express.User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.addressService.remove(user.userId, id);
  }
}
