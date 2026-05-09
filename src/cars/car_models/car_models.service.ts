import { Injectable } from '@nestjs/common';
import { PaginationDto } from 'src/shared/common/pagination/dto/pagination-query-dto';
import { ConfigService } from '@nestjs/config';
import { buildPagination } from 'src/shared/common/pagination/helpers/pagination';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { PaginationResponse } from 'src/shared/common/pagination/interface/paginted-response.interface';
import { ResponseCarModel } from './dto/responsecar_model.dto';
import { createRequestPagination } from 'src/shared/common/pagination/helpers/pagination-response';
import { QueryCarModelDto } from './dto/query-car_model.dt';

@Injectable()
export class CarModelsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ){}

  async findAll(dto: QueryCarModelDto): Promise<PaginationResponse<ResponseCarModel>> {
    const { page, limit, brandId } = dto;
    const {skip, take} = buildPagination(page, limit);
    const res = await this.prisma.model.findMany({
    where: {
      brandId: Number(brandId),
    },
    skip,
    take,
    include:{
      brand: true
    }
  });
    return createRequestPagination(res,page,limit,1000);
  }

}
