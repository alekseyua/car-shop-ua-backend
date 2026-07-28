import { Injectable } from '@nestjs/common';
import { ResponseCarModificationDto } from './dto/response-car_modification.dto';
import { QueryCarModificationDto } from './dto/query-car_modfication.dto';
import { buildPagination } from 'src/shared/common/helpers/pagination';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { createRequestPagination } from 'src/shared/common/helpers/pagination-response';
import { PaginationResponse } from 'src/shared/common/pagination/dto/paginated-response.dto';

@Injectable()
export class ModificationService {
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
              model: true,
              brand: {
                select: {
                  mark: true
                }
              },
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
    const data = modifications.map((m) => ({
      id: m.id,
      modificationAutotechId: m.modificationAutotechId,
      typeName: m.typeName,
      typeRange: m.typeRange,
      kw: m.kw,
      hp: m.hp,
      ccmTech: m.ccmTech,
      capacity: m.capacity,
      cylinders: m.cylinders,
      valve: m.valve,
      tonnage: m.tonnage,
      active: m.active,
      image: m.image,
      fuelId: m.fuelId,
      engineTypeId: m.engineTypeId,
      fuelPreparationId: m.fuelPreparationId,
      bodyTypeId: m.bodyTypeId,
      driveTypeId: m.driveTypeId,
      modelId: m.modelId,

      brand: {
        mark: m.model.brand.mark,
      },

      model: {
        model: m.model.model,
      },

      engineType: {
        name: m.engineType.name,
      },

      bodyType: {
        name: m.bodyType.name,
      },
    }));

    return createRequestPagination(data, page, limit, total);
  }

}

