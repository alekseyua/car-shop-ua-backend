import { Injectable } from '@nestjs/common';
import * as ExcelJs from 'exceljs';
import { ParserService } from 'src/integrations/parser/parser.service';
import { IoredisService } from 'src/core/ioredis/ioredis.service';

@Injectable()
export class ExcelService {
  constructor(
    private readonly parser: ParserService,
    private readonly redis: IoredisService,
  ) {}

  async readFile(data: Uint8Array) {
    const workbook = new ExcelJs.Workbook();

    const buffer = Buffer.from(data);

    await workbook.xlsx.load(buffer as any);
    return workbook;
  }

  async getPriceXLSAutotechnics() {
    const fileXLSBuffer = await this.parser.getPriceXLSProducts();
    if (!fileXLSBuffer) {
      throw new Error('Failed download price');
    }
    const workbook = await this.readFile(fileXLSBuffer);
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new Error('Excel not have worksheet');
    }
    let counter = 1;
    const table: ExcelJs.CellValue[][] = [];
    worksheet.eachRow((row) => {
      counter++;
      if (!Array.isArray(row.values)) {
        return;
      }
      table.push(row.values);
    });
    console.log('Total write ' + counter);
    await this.redis.savePriceRedisPipeline(table);

    return `price download complate and save db`;
  }
}
