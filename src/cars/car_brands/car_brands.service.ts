import { Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/shared/common/pagination/dto/pagination-query-dto';
import { buildPagination } from 'src/shared/common/pagination/helpers/pagination';
import { createRequestPagination } from 'src/shared/common/pagination/helpers/pagination-response';
import { ConfigService } from '@nestjs/config';
import { PaginationResponse } from 'src/shared/common/pagination/interface/paginted-response.interface';
import { ResponseCarBrand } from './dto/response-car_brand.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class CarBrandsService {
  constructor (
    private prisma: PrismaService,
    private config: ConfigService
  ){}

  async findAll(dto: PaginationDto): Promise<PaginationResponse<ResponseCarBrand>> {
    const page = dto.page ?? this.config.get('pagination.defaultPage');
    const limit = dto.limit ?? this.config.get('pagination.maxLimit')
    const {skip, take} = buildPagination(page, limit);
    const [brand, total] = await this.prisma.$transaction([
      this.prisma.brand.findMany({skip,take}),
      this.prisma.brand.count(),
    ]);
    return createRequestPagination(brand, page, limit,total);
  }

}
