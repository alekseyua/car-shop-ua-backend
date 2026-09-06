import { Injectable } from '@nestjs/common';
import { ParserService } from 'src/integrations/parser/parser.service';
import { QueryProductDto } from './dto/query-products.dto';
import {
  ResponseProductDetailParserDto,
  ResponseParserProductDto,
  NormalizeResponseProductDetailDto,
  NormalizeProductItem,
  ProductItem,
  ProductFile,
} from './dto/response-products.dto';
import {
  getProductFromPrice,
  normalizeImagePath,
  normalizeReplaces,
  normalizeResponseProductItem,
} from 'src/shared/common/helpers/helpers';
import { IoredisService } from 'src/core/ioredis/ioredis.service';
import { productCachePriceDto } from 'src/core/ioredis/ioredis.types';

@Injectable()
export class ProductsService {
  constructor(
    private parserService: ParserService,
    private readonly redis: IoredisService,
  ) {}

  async findAll(dto: QueryProductDto): Promise<NormalizeProductItem[]> {
    try {
      const { typeId, groupId } = dto;
      const cacheProductsStr = await this.redis.get(
        `${typeId}-${groupId}-products`,
      );
      if (cacheProductsStr) {
        console.log('Products from cache');
        const cacheProductsObj: ResponseParserProductDto[] | null = JSON.parse(
          cacheProductsStr,
        ) as ResponseParserProductDto[];
        if (!cacheProductsObj) return Promise.resolve([]);
        return await Promise.all(
          cacheProductsObj.map(async (item: ProductItem) => {
            const dataFromPriceCacheObj: productCachePriceDto | null =
              await getProductFromPrice(item.itemNo, this.redis);
              console.log({
                item,
                itemStock: item.stock,
                dataFromPriceCacheObj,
                stock: dataFromPriceCacheObj?.stock.Stock,
              });
            return normalizeResponseProductItem(item, dataFromPriceCacheObj);
          }),
        );
      }
      const getProduct: ResponseParserProductDto[] =
        await this.parserService.getProduct(typeId, groupId);
      const products = await Promise.all(
        getProduct.map(async (item) => {
          const dataFromPriceCacheObj = await getProductFromPrice(
            item.itemNo,
            this.redis,
          );
          return normalizeResponseProductItem(item, dataFromPriceCacheObj);
        }),
      );
      if (getProduct) {
        await this.redis.set(
          `${typeId}-${groupId}-products`,
          JSON.stringify(getProduct),
        );
      }
      console.log('Products from autotechnics');

      return products;
    } catch (error) {
      console.log(error);
      throw error;
    }
    //getProduct
  }

  // getItemDetails
  async findOne(id: string): Promise<NormalizeResponseProductDetailDto> {
    try {
      const cacheProductOneStr = await this.redis.get('product_one:' + id);
      if (cacheProductOneStr) {
        const cacheProductOne: ResponseProductDetailParserDto = JSON.parse(
          cacheProductOneStr,
        ) as ResponseProductDetailParserDto;
        const dataFromPriceCacheObj = await getProductFromPrice(
          cacheProductOne.item.itemNo,
          this.redis,
        );
        const files = cacheProductOne.files.map((f: ProductFile) => {
          const pathName = normalizeImagePath(f.pathName) as string;
          return {
            ...f,
            pathName,
          };
        });
        return {
          ...cacheProductOne,
          item: normalizeResponseProductItem(
            cacheProductOne.item,
            dataFromPriceCacheObj,
          ),
          files,
          replaces: await normalizeReplaces(
            cacheProductOne.replaces,
            this.redis,
          ),
        };
      }

      const response: ResponseProductDetailParserDto =
        await this.parserService.getItemDetails(id);
      const dataFromPriceCacheObj = await getProductFromPrice(
        response.item.itemNo,
        this.redis,
      );
      if (response) {
        await this.redis.set('product_one:' + id, JSON.stringify(response));
      }
      const files = response.files.map((f: ProductFile) => {
        const pathName = normalizeImagePath(f.pathName) as string;
        return {
          ...f,
          pathName,
        };
      });
      const res: NormalizeResponseProductDetailDto = {
        ...response,
        item: normalizeResponseProductItem(
          response.item,
          dataFromPriceCacheObj,
        ),
        files,
        replaces: await normalizeReplaces(response.replaces, this.redis),
      };
      return res;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // getListTopProducts
  async getListTopProducts(): Promise<NormalizeProductItem[]> {
    try {
      const cacheTopProductsStr = await this.redis.get('top-products');
      if (cacheTopProductsStr) {
        console.log('Top products from cache');
        const cacheTopProducts: ResponseParserProductDto[] | null = JSON.parse(
          cacheTopProductsStr,
        ) as ResponseParserProductDto[];
        if (!cacheTopProducts) return Promise.resolve([]);
        return await Promise.all(
          cacheTopProducts.map(
            async (item: ProductItem): Promise<NormalizeProductItem> => {
              const dataFromPriceCacheObj = await getProductFromPrice(
                item.itemNo,
                this.redis,
              );
              return normalizeResponseProductItem(item, dataFromPriceCacheObj);
            },
          ),
        );
      }
      const response: ResponseParserProductDto[] =
        await this.parserService.getTopProducts();
      if (response) {
        await this.redis.set('top-products', JSON.stringify(response));
      }

      const serializeTopProducts = await Promise.all(
        response.map(async (item: ProductItem) => {
          const dataFromPriceCacheObj = await getProductFromPrice(
            item.itemNo,
            this.redis,
          );
          return normalizeResponseProductItem(item, dataFromPriceCacheObj);
        }),
      );
      console.log('Top products from autotechnics');

      return serializeTopProducts;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
