import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { productCachePriceDto } from './ioredis.types';
import { Stock } from 'src/shared/common/helpers/types';
import * as ExcelJs from 'exceljs';
import {
  cellToString,
  normalizeDoubleNumber,
  normalizeItemNoForSearch,
} from 'src/shared/common/helpers/helpers';

@Injectable()
export class IoredisService {
  private readonly redis: Redis;
  constructor(private readonly config: ConfigService) {
    this.redis = new Redis({
      host: this.config.get('REDIS_HOST'),
      port: this.config.get('REDIS_PORT'),
      password: this.config.get('REDIS_USER_PASSWORD'),
      username: this.config.get('REDIS_USER'),
    });
  }

  async hgetall(key: string) {
    return await this.redis.hgetall(key);
  }

  async set(key: string, value: string) {
    await this.redis.set(key, value);
  }

  async get(key: string) {
    return await this.redis.get(key);
  }

  async remove(key: string) {
    await this.redis.del(key);
  }

  async removeAll() {
    await this.redis.flushdb();
  }
  async ping() {
    return this.redis.ping();
  }
  async call(command: string, ...args: string[]) {
    return this.redis.call(command, ...args);
  }

  async savePriceRedisPipeline(data: ExcelJs.CellValue[][]) {
    const batchSize = 1000;
    const city_1 = cellToString(data[0]?.[10]);
    const city_2 = cellToString(data[0]?.[11]);
    const city_3 = cellToString(data[0]?.[12]);
    const city_4 = cellToString(data[0]?.[13]);
    const city_5 = cellToString(data[0]?.[14]);
    for (let i = 1; i < data.length; i += batchSize) {
      const pipeline = this.redis.pipeline();
      for (const row of data.slice(i, i + batchSize)) {
        const stock: Stock = {
          Stock: [
            { L: city_1, C: city_1, Q: cellToString(row[10]), R: 0 },
            { L: city_2, C: city_2, Q: cellToString(row[11]), R: 0 },
            { L: city_3, C: city_3, Q: cellToString(row[12]), R: 0 },
            { L: city_4, C: city_4, Q: cellToString(row[13]), R: 0 },
            { L: city_5, C: city_5, Q: cellToString(row[14]), R: 0 },
          ],
        };
        const price = normalizeDoubleNumber(cellToString(row[5]));
        const itemNo = cellToString(row[2]);
        const name = cellToString(row[3]);
        const catItemNo = normalizeItemNoForSearch(cellToString(row[9]));

        const product: productCachePriceDto = {
          price,
          itemNo,
          name,
          catItemNo,
          stock,
        };
        pipeline.hset('price:' + cellToString(row[2]), {
          ...product,
          stock: JSON.stringify(stock),
        });
      }
      await pipeline.exec();
    }
    console.log('save complate');
  }

  async search(index: string, query: string, limit = 20, offset = 0) {
    return this.redis.call(
      'FT.SEARCH',
      index,
      query,
      'RETURN',
      '4',
      'itemNo',
      'name',
      'price',
      'catItemNo',
      'LIMIT',
      offset.toString(),
      limit.toString(),
    );
  }
}
