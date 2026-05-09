import { Injectable } from '@nestjs/common';
import { CreateCarBrandDto } from './dto/create-car_brand.dto';
import { UpdateCarBrandDto } from './dto/update-car_brand.dto';
import { PrismaService } from '../prisma/prisma.service';
import { paginationDto } from 'src/shared/common/pagination/dto/pagination-query-dto';
import { buildPagination } from 'src/shared/common/pagination/helpers/pagination';
import { createRequestPagination } from 'src/shared/common/pagination/helpers/pagination-response';
import paginationConfig from 'src/config/pagination.config';
import { ConfigService } from '@nestjs/config';
import { PaginationResponse } from 'src/shared/common/pagination/interface/paginted-response.interface';
import { ResponseCarBrand } from './dto/response-car_brand.dto';

@Injectable()
export class CarBrandsService {
  constructor (
    private prisma: PrismaService,
    private config: ConfigService
  ){}

  create(createCarBrandDto: CreateCarBrandDto) {
    return 'This action adds a new carBrand';
  }

  async findAll(dto: paginationDto): Promise<PaginationResponse<ResponseCarBrand>> {
    const page = dto.page ?? this.config.get('pagination.defaultPage');
    const limit = dto.limit ?? this.config.get('pagination.maxLimit')
    const {skip, take} = buildPagination(page, limit);
    const [brand, total] = await this.prisma.$transaction([
      this.prisma.brand.findMany({skip,take}),
      this.prisma.brand.count(),
    ]);
    return createRequestPagination(brand, page, limit,total);
  }

  findOne(id: number) {
    return `This action returns a #${id} carBrand`;
  }

  update(id: number, updateCarBrandDto: UpdateCarBrandDto) {
    return `This action updates a #${id} carBrand`;
  }

  remove(id: number) {
    return `This action removes a #${id} carBrand`;
  }
}
