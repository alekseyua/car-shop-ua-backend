import { Injectable } from '@nestjs/common';
import { CreateExcelDto } from './dto/create-excel.dto';
import { UpdateExcelDto } from './dto/update-excel.dto';
import * as ExcelJs from 'exceljs';
import { ParserService } from 'src/integrations/parser/parser.service';
import { IoredisService } from 'src/core/ioredis/ioredis.service';

@Injectable()
export class ExcelService {
 
  constructor(
    private readonly parser: ParserService,
    private readonly redis: IoredisService
  ){}
 
  async readFile(data: Uint8Array) {
    const workbook = new ExcelJs.Workbook();

    const buffer = Buffer.from(data);

    await workbook.xlsx.load(buffer as any);
    return workbook;
  }

  create(createExcelDto: CreateExcelDto) {
    return 'This action adds a new excel';
  }

  async getPriceXLSAutotechnics() {
        const fileXLSBuffer = await this.parser.getPriceXLSProducts();
        if(!fileXLSBuffer){
           throw new Error('Failed download price')
        }
        const workbook = await this.readFile(fileXLSBuffer);
        const worksheet = workbook.getWorksheet(1);
        if(!worksheet){
          throw new Error('Excel not have worksheet')
        }
        let counter = 1;
    const table: ExcelJs.CellValue[][] = [];
        worksheet.eachRow((row,rowNumber) => {
          counter++
          if (!Array.isArray(row.values)) {
            return;
          }
          table.push(row.values)
         }) 
         console.log('Total write ' + counter);
         await this.redis.savePriceRedisPipeline(table);

    return `price download complate and save db`;
  }

  findOne(id: number) {
    return `This action returns a #${id} excel`;
  }

  update(id: number, updateExcelDto: UpdateExcelDto) {
    return `This action updates a #${id} excel`;
  }

  remove(id: number) {
    return `This action removes a #${id} excel`;
  }
}
