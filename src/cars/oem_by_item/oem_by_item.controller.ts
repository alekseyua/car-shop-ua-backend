import { Controller, Get, Param } from '@nestjs/common';
import { OemByItemService } from './oem_by_item.service';
import { QueryOemByItemDto } from './dto/query_oem_by_item.dto';
import { ResponseOemByItemDto } from './dto/response_oem_by_item.dto';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('oem-by-item')
export class OemByItemController {
  constructor(private readonly oemByItemService: OemByItemService) {}

  // @Post()
  // create(@Body() createOemByItemDto: CreateOemByItemDto) {
  //   return this.oemByItemService.create(createOemByItemDto);
  // }

  // @Get()
  // findAll() {
  //   return this.oemByItemService.findAll();
  // }

  @ApiOkResponse({
    type: [ResponseOemByItemDto],
  })
  @Get(':id')
  async findOne(
    @Param() param: QueryOemByItemDto,
  ): Promise<ResponseOemByItemDto[]> {
    console.log('param', param);
    return await this.oemByItemService.findOne({ id: param.id });
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOemByItemDto: UpdateOemByItemDto) {
  //   return this.oemByItemService.update(+id, updateOemByItemDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.oemByItemService.remove(+id);
  // }
}
