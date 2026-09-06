import { Controller, Get, Query, Res } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { QueryPdfRequest } from './dto/query-proxy.dto';
import { Response } from 'express';

@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('pdf')
  async pdf(@Query() dto: QueryPdfRequest, @Res() res: Response) {
    const { buffer, contentType } = await this.proxyService.getPdf(dto);

    console.log('PDF size:', buffer.length);
    console.log('Content type:', contentType);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');

    return res.end(buffer);
  }
}
