import { Controller, Get, Param } from '@nestjs/common';
import { OemService } from './oem.service';
import { QueryOemByItemDto } from './dto/query_oem_by_item.dto';
import { ResponseOemByItemDto } from './dto/response_oem_by_item.dto';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('oem-by-item')
export class OemController {
  constructor(private readonly OemService: OemService) {}

  // @Post()
  // create(@Body() createOemByItemDto: CreateOemByItemDto) {
  //   return this.OemService.create(createOemByItemDto);
  // }

  // @Get()
  // findAll() {
  //   return this.OemService.findAll();
  // }

  @ApiOkResponse({
    type: [ResponseOemByItemDto],
  })
  @Get(':id')
  async findOne(
    @Param() param: QueryOemByItemDto,
  ): Promise<ResponseOemByItemDto[]> {
    console.log('param', param);
    return await this.OemService.findOne({ id: param.id });
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOemByItemDto: UpdateOemByItemDto) {
  //   return this.OemService.update(+id, updateOemByItemDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.OemService.remove(+id);
  // }
}
