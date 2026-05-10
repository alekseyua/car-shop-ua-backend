import { Injectable } from '@nestjs/common';
import { buildPagination } from 'src/shared/common/pagination/helpers/pagination';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { ResponseCarModelDto } from './dto/response-car_model.dto';
import { createRequestPagination } from 'src/shared/common/pagination/helpers/pagination-response';
import { QueryCarModelDto } from './dto/query-car_model.dt';
import { PaginationResponse } from 'src/shared/common/pagination/dto/paginated-response.dto';

@Injectable()
export class CarModelsService {
  constructor(
    private prisma: PrismaService,
  ) { }

  async findAll(dto: QueryCarModelDto): Promise<PaginationResponse<ResponseCarModelDto>> {
    const { page, limit, brandId } = dto;
    const { skip, take } = buildPagination(page, limit);
    const idBrand = Number(brandId);
    const [models, total] = await this.prisma.$transaction([
      this.prisma.model.findMany({
        where: {
          brandId: idBrand,
        },
        skip,
        take,
      }),
      this.prisma.model.count({ where: { brandId: idBrand } })
    ])
    return createRequestPagination(models, page, limit, total);
  }

}
