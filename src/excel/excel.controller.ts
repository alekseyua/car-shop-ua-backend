import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExcelService } from './excel.service';
import { CreateExcelDto } from './dto/create-excel.dto';
import { UpdateExcelDto } from './dto/update-excel.dto';
import { ParserService } from 'src/integrations/parser/parser.service';

@Controller('excel')
export class ExcelController {
  constructor(
    private readonly excelService: ExcelService,
  ) {}

  
  @Post()
  create(@Body() createExcelDto: CreateExcelDto) {
    return this.excelService.create(createExcelDto);
  }

  @Get()
  getPriceXLSAutotechnics() {
    return this.excelService.getPriceXLSAutotechnics(); 
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.excelService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExcelDto: UpdateExcelDto) {
    return this.excelService.update(+id, updateExcelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.excelService.remove(+id);
  }
}
