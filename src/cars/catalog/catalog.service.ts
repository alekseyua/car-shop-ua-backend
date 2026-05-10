import { Injectable } from '@nestjs/common';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { ParserService } from 'src/parser/parser.service';
import { QueryCatalogDto } from './dto/query-catalog.dto';
import { PaginationResponse } from 'src/shared/common/pagination/dto/paginated-response.dto';
import { ResponseCatalogCarDto } from './dto/response-catalog.dto';
import { createRequestPagination } from 'src/shared/common/pagination/helpers/pagination-response';

@Injectable()
export class CatalogService {
  constructor(
    private prisma: PrismaService,
    private parser: ParserService
  ){}

  create(createCatalogDto: CreateCatalogDto) {
    return 'This action adds a new catalog';
  }

  async findAll(dto: QueryCatalogDto): Promise<PaginationResponse<ResponseCatalogCarDto>> {
    const {typeId, page, limit} = dto;
    console.time('start');
    const fromParser = await this.parser.getCatalog(typeId);
    console.timeEnd('start');

    return createRequestPagination(fromParser, page, limit, 1000);
  }

  findOne(id: number) {
    return `This action returns a #${id} catalog`;
  }

  update(id: number, updateCatalogDto: UpdateCatalogDto) {
    return `This action updates a #${id} catalog`;
  }

  remove(id: number) {
    return `This action removes a #${id} catalog`;
  }
}
