import { Injectable } from '@nestjs/common';
import { IoredisService } from 'src/core/ioredis/ioredis.service';
import { ParserService } from 'src/integrations/parser/parser.service';
import {
  AccessoryCategoryDto,
  ProductAccessoriesDto,
  QueryCatalogAccessoriesDto,
  ResponseProductAccessoriesDto,
} from './dto/response.accessories.dto';
import { PaginationResponse } from 'src/shared/common/pagination/dto/paginated-response.dto';
import { createRequestPagination } from 'src/shared/common/helpers/pagination-response';
import {
  buildPagination,
  sliceArrayPagination,
} from 'src/shared/common/helpers/pagination';
import {
  markupPercentPrice,
  normalizeImagePath,
  normalizeStock,
} from 'src/shared/common/helpers/helpers';
import { adminConfig } from 'src/core/config/admin.config';

@Injectable()
export class AccessoriesService {
  constructor(
    private readonly parser: ParserService,
    private readonly redis: IoredisService,
  ) {}
  private readonly memoryCache = new Map<string, ProductAccessoriesDto[]>();
  async getMenuAccessories() {
    const cacheAccessories: string | null = await this.redis.get('accessories');
    if (cacheAccessories) {
      console.log('Data get from cache');
      const leadToTheObject = JSON.parse(
        cacheAccessories,
      ) as AccessoryCategoryDto[];
      return leadToTheObject;
    }
    const accessoriesParser: AccessoryCategoryDto[] =
      await this.parser.getMenuAccessories();
    // console.log(accessoriesParser[0].childElements[0].childElements);
    if (!accessoriesParser) {
      throw new Error('Field parsing data');
    }
    await this.redis.set('accessories', JSON.stringify(accessoriesParser));
    return accessoriesParser;
  }

  async getCatalogAccessories(
    dto: QueryCatalogAccessoriesDto,
  ): Promise<PaginationResponse<ResponseProductAccessoriesDto>> {
    const { id, page, limit } = dto;

    const timerStart = performance.now();

    const { skip, take } = buildPagination(page, limit);

    const cacheKey = `accessories-catalog-${id}`;

    let catalog: ProductAccessoriesDto[];

    // 1. MEMORY CACHE
    const memoryData = this.memoryCache.get(cacheKey);

    if (memoryData) {
      console.log(
        `[CACHE] memory hit: ${(performance.now() - timerStart).toFixed(2)} ms`,
      );

      catalog = memoryData;
    } else {
      // 2. REDIS CACHE
      const redisStart = performance.now();

      const cacheCatalogAccessories = await this.redis.get(cacheKey);

      console.log(
        `[CACHE] redis get: ${(performance.now() - redisStart).toFixed(2)} ms`,
      );

      if (cacheCatalogAccessories) {
        catalog = JSON.parse(
          cacheCatalogAccessories,
        ) as ProductAccessoriesDto[];

        // сохраняем в память
        this.memoryCache.set(cacheKey, catalog);

        console.log(
          `[CACHE] redis hit + memory set: ${(
            performance.now() - timerStart
          ).toFixed(2)} ms`,
        );
      } else {
        // 3. EXTERNAL API
        const parserStart = performance.now();

        catalog = await this.parser.getCatalogAccessories(id);

        console.log(
          `[CACHE] parser: ${(performance.now() - parserStart).toFixed(2)} ms`,
        );

        if (!catalog) {
          throw new Error('Field parsing data');
        }

        // Redis
        await this.redis.set(cacheKey, JSON.stringify(catalog));

        // Memory
        this.memoryCache.set(cacheKey, catalog);
      }
    }

    const amount = catalog.length;

    const sliceObj = sliceArrayPagination(catalog as [], skip, take);
    const serializeCatalog = sliceObj.map((item: ProductAccessoriesDto) => ({
      ...item,
      firstPic: normalizeImagePath(item.firstPic as string) as string,
      price: markupPercentPrice(item.price),
      stock: normalizeStock(item.stock, adminConfig.autotechsnicsCity),
    }));
    return createRequestPagination(serializeCatalog, page, limit, amount);
  }
}
