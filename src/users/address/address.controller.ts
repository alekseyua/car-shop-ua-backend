import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Req() req,
    @Body() dto: CreateAddressDto,
  ) {
    return this.addressService.create(
      req.user.userId,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req) {
    return this.addressService.findAll(
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/default')
  setDefault(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.addressService.setDefault(
      req.user.userId,
      id,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.addressService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
    return this.addressService.update(+id, updateAddressDto);
  }

  @Delete(':id')
  remove(@Param() { 
    userId,
    addressId }: { userId: number, addressId: number }) {
    return this.addressService.remove(userId, addressId);
  }
}
