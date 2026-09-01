import { Injectable } from '@nestjs/common';
import { NormalizeCarModification } from './dto/response-car_modification.dto';
import { QueryCarModificationDto } from './dto/query-car_modfication.dto';
import { buildPagination } from 'src/shared/common/helpers/pagination';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { createRequestPagination } from 'src/shared/common/helpers/pagination-response';
import { PaginationResponse } from 'src/shared/common/pagination/dto/paginated-response.dto';
import { normalizeModification } from 'src/shared/common/helpers/helpers';
import { Prisma } from 'generated/prisma/client';

export const modificationInclude = {
  model: {
    select: {
      model: true,
      brand: {
        select: {
          mark: true,
        },
      },
    },
  },
  engineType: {
    select: {
      name: true,
    },
  },
  bodyType: {
    select: {
      name: true,
    },
  },
} satisfies Prisma.ModificationInclude;

@Injectable()
export class ModificationService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    dto: QueryCarModificationDto,
  ): Promise<PaginationResponse<NormalizeCarModification>> {
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
        include: modificationInclude,
      }),
      this.prisma.modification.count({ where: { modelId: idModel } }),
    ]);
    const data = modifications.map((m) => normalizeModification(m));

    return createRequestPagination(data, page, limit, total);
  }
}
