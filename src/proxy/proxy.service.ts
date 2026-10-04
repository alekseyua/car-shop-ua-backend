import { Injectable } from '@nestjs/common';
import { QueryPdfRequest } from './dto/query-proxy.dto';

@Injectable()
export class ProxyService {
  private readonly allowedHost = 'img2.ad.ua';

  async getPdf(dto: QueryPdfRequest) {
    const { pdf } = dto;
    const isHttp = pdf.includes('http://') || pdf.includes('https://');
    const response = await fetch(
      isHttp ? pdf : 'https://img2.ad.ua/imgs/' + pdf,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    return {
      buffer,
      contentType: response.headers.get('content-type') || 'application/pdf',
    };
  }
}
