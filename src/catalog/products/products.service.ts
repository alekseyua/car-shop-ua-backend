import { Injectable } from '@nestjs/common';
import { ParserService } from 'src/integrations/parser/parser.service';
import { QueryProductDto } from './dto/query-products.dto';
import {
  ResponseProductDetailDto,
  ResponseProductDto,
  ResponseParserProductDto,
  ProductItem,
} from './dto/response-products.dto';
import {
  markupPercentPrice,
  normalizeDoubleNumber,
  normalizeImagePath,
  normalizeStock,
} from 'src/shared/common/helpers/helpers';
import { adminConfig } from 'src/core/config/admin.config';
import { IoredisService } from 'src/core/ioredis/ioredis.service';

@Injectable()
export class ProductsService {
  constructor(private parserService: ParserService,
    private readonly redis: IoredisService
  ) {}

  private async getProductFromPrice (itemNo: string): Promise<{} | null> {
    const productFromPriceCache = await this.redis.get(itemNo);
    if (!productFromPriceCache) {
      console.log('getProductFromPrice failde to find product from price cache - ' + itemNo)
    }
    return productFromPriceCache ? JSON.parse(productFromPriceCache) : null;
  }

  async findAll(dto: QueryProductDto): Promise<ResponseProductDto[]> {
    try {
      const { typeId, groupId } = dto;
      const cachProductsStr = await this.redis.get(`${typeId}-${groupId}-products`);
      if (cachProductsStr) {
        console.log('Products from cache')
        const cachProducts = JSON.parse(cachProductsStr);
        return await Promise.all(cachProducts.map(async (item: ResponseProductDto) => {
          const productFromPriceCacheObj = await this.getProductFromPrice(item.itemNo);

          return {
            itemNo: item.itemNo,
            brand: item.brand,
            quantity: item.quantity,
            description: item.description,
            searchDescription: item.searchDescription,
            inStock: item.inStock,
            firstPic: normalizeImagePath(item.firstPic as string) as string,
            criteriaLine: item.criteriaLine,
            retail: item.retail,
            salesUoM: item.salesUoM,
            criterias: item.criterias,
            price: productFromPriceCacheObj
              ? markupPercentPrice(normalizeDoubleNumber(productFromPriceCacheObj[4]))
              : markupPercentPrice(item.price),
            stock: productFromPriceCacheObj
              ? normalizeStock(productFromPriceCacheObj[9], adminConfig.autotechsnicsCity)
              : item.stock,
          }
        }));
      }
      const getProduct: ResponseParserProductDto[] =
        await this.parserService.getProduct(typeId, groupId);
      const products = await Promise.all(getProduct.map(async (item) => {
        const productFromPriceCacheObj = await this.getProductFromPrice(item.itemNo);

        return {
        itemNo: item.itemNo,
        brand: item.brand,
        quantity: item.quantity,
        description: item.description,
        searchDescription: item.searchDescription,
        inStock: item.inStock,
        firstPic: normalizeImagePath( item.firstPic as string) as string,
        criteriaLine: item.criteriaLine,
        retail: item.retail,
        salesUoM: item.salesUoM,
        criterias: item.criterias,
        // price: markupPercentPrice(item.price),
        // stock: normalizeStock(item.stock, adminConfig.autotechsnicsCity),
          price: productFromPriceCacheObj 
            ? markupPercentPrice(normalizeDoubleNumber(productFromPriceCacheObj[4])) 
            : markupPercentPrice(item.price),
          stock: productFromPriceCacheObj 
            ? normalizeStock(productFromPriceCacheObj[9], adminConfig.autotechsnicsCity) 
            : normalizeStock(item.stock, adminConfig.autotechsnicsCity),
      }}));
      if(products) {
        await this.redis.set(`${typeId}-${groupId}-products`, JSON.stringify(products))
      }
      console.log('Products from autotechnics')

      return products;
    } catch (error) {
      console.log(error);
      throw error;
    }
    //getProduct
  }

  // getItemDetails
  async findOne(id: string): Promise<ResponseProductDetailDto> {
    try {
      // здесь кеш временно для тестов
      const response: ResponseProductDetailDto =
        await this.parserService.getItemDetails(id);
      if (
        !response.files &&
        !response.item &&
        !response.replaces &&
        !response.pictures
      ) {
        return response;
      }

      if (!response.item) {
        return response;
      }
      const normolizeReplaces = await Promise.all((response.replaces ?? [])?.filter((item: ProductItem)=>item.inStock)?.map(async (item: any) => {
        const productFromPriceCacheObj = await this.getProductFromPrice(item.itemNo);
        if (!productFromPriceCacheObj){
          console.log('itemNo - ', item.itemNo, '---' ,item.stock)
        }
        return {
          ...item,
          firstPic: normalizeImagePath(item.firstPic as string) as string,
          price: productFromPriceCacheObj ? markupPercentPrice(normalizeDoubleNumber(productFromPriceCacheObj[4])) : item.price,
          stock: productFromPriceCacheObj ? normalizeStock(productFromPriceCacheObj[9], adminConfig.autotechsnicsCity) : normalizeStock(item.stock, adminConfig.autotechsnicsCity),
        }
      }));

      const cacheProductOneStr = await this.redis.get('product - one'+id);
      if(cacheProductOneStr){
        const cacheProductOne = JSON.parse(cacheProductOneStr);
        const productFromPriceCacheObj = await this.getProductFromPrice(cacheProductOne.item.itemNo);

        return {
          ...cacheProductOne,
          item: {
            ...cacheProductOne.item,
            firstPic: normalizeImagePath(cacheProductOne.item.firstPic as string) as string,
            price: productFromPriceCacheObj ? markupPercentPrice(normalizeDoubleNumber(productFromPriceCacheObj[4])) : cacheProductOne.item.price,
            stock: productFromPriceCacheObj ? normalizeStock(productFromPriceCacheObj[9], adminConfig.autotechsnicsCity) : normalizeStock(
              cacheProductOne.item.stock as string,
              adminConfig.autotechsnicsCity,
            ),
          },
          replaces: normolizeReplaces ?? null,
        };
      }

      const productFromPriceCacheObj = await this.getProductFromPrice(response.item.itemNo);
      if (productFromPriceCacheObj){
        this.redis.set('product-one' + id, JSON.stringify(productFromPriceCacheObj))
      }
      
      const res: ResponseProductDetailDto = {
        ...response,
        item: {
          ...response.item,
          firstPic: normalizeImagePath(response.item.firstPic as string) as string,
          price: productFromPriceCacheObj ? markupPercentPrice(normalizeDoubleNumber(productFromPriceCacheObj[4])) : markupPercentPrice(response.item.price),
          stock: productFromPriceCacheObj ? normalizeStock(productFromPriceCacheObj[9], adminConfig.autotechsnicsCity) : normalizeStock(
            response.item.stock as string,
            adminConfig.autotechsnicsCity,
          ),
        },
        replaces: normolizeReplaces ?? null,
      };
      return res;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // getListTopProducts
  async getListTopProducts(): Promise<ResponseProductDto[]> {
    try {
      const cachTopProductsStr = await this.redis.get('top-products');
      if (cachTopProductsStr){
        console.log('Top products from cache')
        const cachTopProducts = JSON.parse(cachTopProductsStr);
        return await Promise.all(cachTopProducts.map(async (item: any) => {
          const productFromPriceCacheObj = await this.getProductFromPrice(item.itemNo);

          return {
            ...item,
            firstPic: normalizeImagePath(item.firstPic as string) as string,
            price: productFromPriceCacheObj ? markupPercentPrice(normalizeDoubleNumber(productFromPriceCacheObj[4])) : markupPercentPrice(item.price),
            stock: productFromPriceCacheObj ? normalizeStock(productFromPriceCacheObj[9], adminConfig.autotechsnicsCity) : normalizeStock(item.stock, adminConfig.autotechsnicsCity),
          }
        }));
      }
      const response: any[] =
      await this.parserService.getTopProducts();
      if(response){
        await this.redis.set('top-products', JSON.stringify(response));
      }

      const serializeTopProducts = await Promise.all(response.map( async (item) => {
        const productFromPriceCacheObj = await this.getProductFromPrice(item.itemNo);
        return {
          ...item,
          firstPic: normalizeImagePath(item.firstPic as string) as string,
          price: productFromPriceCacheObj ? markupPercentPrice(normalizeDoubleNumber(productFromPriceCacheObj[4])) : markupPercentPrice(item.price),
          stock: productFromPriceCacheObj ? normalizeStock(productFromPriceCacheObj[9], adminConfig.autotechsnicsCity) : normalizeStock(item.stock, adminConfig.autotechsnicsCity),
      }}))
      console.log('Top products from autotechnics')

      return serializeTopProducts;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
