import { Injectable } from '@nestjs/common';
import { ResponseCarModificationDto } from './dto/response-car_modification.dto';
import { QueryCarModificationDto } from './dto/query-car_modfication.dto';
import { buildPagination } from 'src/shared/common/pagination/helpers/pagination';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { createRequestPagination } from 'src/shared/common/pagination/helpers/pagination-response';
import { PaginationResponse } from 'src/shared/common/pagination/dto/paginated-response.dto';

@Injectable()
export class CarModificationService {
  constructor(private prisma: PrismaService) { }

  async findAll(dto: QueryCarModificationDto): Promise<PaginationResponse<ResponseCarModificationDto>> {

    const { page, limit, modelId } = dto;
    const { skip, take } = buildPagination(page, limit);
    const idModel = Number(modelId);
    const [modifications, total] = await this.prisma.$transaction([
      this.prisma.modification.findMany({
        where: {
          modelId: idModel,
        },
        skip,
        take,
        include:{
          model: {
            select: {
              model: true
            }
          },
          engineType: {
            select: {
              name: true
            }
          },
          bodyType: {
            select: {
              name: true
            }
          },
        }
      }),
      this.prisma.modification.count({ where: { modelId: idModel } })
    ])
    return createRequestPagination(modifications, page, limit, total);
  }

}

