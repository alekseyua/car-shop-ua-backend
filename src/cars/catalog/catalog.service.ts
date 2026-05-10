import { Injectable } from '@nestjs/common';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { ParserService } from 'src/parser/parser.service';
import { QueryCatalogDto } from './dto/query-catalog.dto';
import { PaginationResponse } from 'src/shared/common/pagination/dto/paginated-response.dto';
import { ResponseCatalogCarDto } from './dto/response-catalog.dto';
import { createRequestPagination } from 'src/shared/common/pagination/helpers/pagination-response';
import { buildPagination } from 'src/shared/common/pagination/helpers/pagination';

@Injectable()
export class CatalogService {
  constructor(
    private prisma: PrismaService,
    private parser: ParserService
  ){}

  async create(dto: CreateCatalogDto[]) {
   await this.prisma.catalogCar.createMany({
    data: dto.map(item => ({
        groupId: item.groupId,
        groupCode: item.groupCode,
        subGroupCode: item.subGroupCode,
        count: item.count,
        typeAutotechId: item.typeId,
        modificationId: item.typeId
    })),
  });
    return 'This action adds a new catalog';
  }

  async findAll(dto: QueryCatalogDto): Promise<PaginationResponse<ResponseCatalogCarDto>> {
    const {typeAutotechId, page, limit} = dto;
    const {skip, take} = buildPagination(page,limit);
    const [catalogDb, totalDb] = await this.prisma.$transaction([
      this.prisma.catalogCar.findMany({
        where: {
          typeAutotechId: Number(typeAutotechId)
        },
        skip,
        take
      }),
      this.prisma.catalogCar.count()
    ])
    if(!catalogDb.length){
      // todo: 
      // пока возвращает полный список с парсинга
      // не сделано и не продумана логика по обновлению данных
      const fromParser = await this.parser.getCatalog(typeAutotechId);
      this.create(fromParser)
      return createRequestPagination(fromParser, page, limit, fromParser.length);
    }else{
      return createRequestPagination(catalogDb, page, limit, totalDb);
    }

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
