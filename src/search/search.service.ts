import { Injectable } from '@nestjs/common';
import { IoredisService } from 'src/core/ioredis/ioredis.service';
import {
  RedisSearchResult,
  SearchResultResponse,
} from './dto/response-search.dto';
import { buildPagination } from 'src/shared/common/helpers/pagination';
import { markupPercentPrice, normalizeDoubleNumber } from 'src/shared/common/helpers/helpers';

@Injectable()
export class SearchService {
  constructor(private readonly redis: IoredisService) {}

  async searchProducts(
    textSearch: string,
    take: number,
    skip: number,
  ): Promise<SearchResultResponse> {
    if (!textSearch) {
      return {
        total: 0,
        products: [],
      };
    }
    const resultName = (await this.redis.search(
      'idx:price_autotechnics',
      `@name:*${textSearch}*`,
      take,
      skip,
    )) as [number, ...unknown[]];

    const total = resultName[0];

    const products: RedisSearchResult[] = [];
    for (let i = 1; i < resultName.length; i += 2) {
      const fields = resultName[i + 1] as string[];

      const product: Record<string, string> = {};

      for (let j = 0; j < fields.length; j += 2) {
        product[fields[j]] = fields[j + 1];
      }

      products.push({
        ...product,
        price: markupPercentPrice(normalizeDoubleNumber(product.price)),
      } as unknown as RedisSearchResult);
    }

    const resultItemNo = (await this.redis.search(
      'idx:price_autotechnics',
      `@catItemNo:*${textSearch}*`,
      20,
      0,
    )) as [number, ...unknown[]];
    for (let i = 1; i < resultItemNo.length; i += 2) {
      const fields = resultItemNo[i + 1] as string[];

      const product: Record<string, string> = {};

      for (let j = 0; j < fields.length; j += 2) {
        product[fields[j]] = fields[j + 1];
      }

      products.push({
        ...product,
        price: markupPercentPrice(normalizeDoubleNumber(product.price)),
      } as unknown as RedisSearchResult);
    }
    return {
      total,
      products,
    };
  }

  async findAll(
    user: Express.User,
    q: string,
    page: number,
    limit: number,
  ): Promise<SearchResultResponse> {
    const { skip, take } = buildPagination(page, limit);

    return await this.searchProducts(q.trim(), take, skip);
  }
}
