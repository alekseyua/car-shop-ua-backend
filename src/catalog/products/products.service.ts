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

  async findAll(dto: QueryProductDto): Promise<ResponseProductDto[]> {
    try {
      const { typeId, groupId } = dto;
      const getProduct: ResponseParserProductDto[] =
        await this.parserService.getProduct(typeId, groupId);
      // console.log(getProduct[0], getProduct.length);
      return getProduct.map((item) => ({
        itemNo: item.itemNo,
        brand: item.brand,
        quantity: item.quantity,
        description: item.description,
        searchDescription: item.searchDescription,
        inStock: item.inStock,
        firstPic: normalizeImagePath( item.firstPic as string) as string,
        criteriaLine: item.criteriaLine,
        retail: item.retail,
        price: markupPercentPrice(item.price),
        salesUoM: item.salesUoM,
        criterias: item.criterias,
        stock: normalizeStock(item.stock, adminConfig.autotechsnicsCity),
      }));
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
      const cacheProductOneStr = await this.redis.get('product - one'+id);
      if(cacheProductOneStr){
        const cacheProductOne = JSON.parse(cacheProductOneStr);
        return cacheProductOne;
      }
      const normolizeReplaces = response.replaces?.map((item: ProductItem) => ({
        ...item,
        price: markupPercentPrice(item.price),
      }));

      const res: ResponseProductDetailDto = {
        ...response,
        item: {
          ...response.item,
          price: markupPercentPrice(response.item.price),
          stock: normalizeStock(
            response.item.stock as string,
            adminConfig.autotechsnicsCity,
          ),
        },
        replaces: normolizeReplaces ?? null,
      };
      if(res){
        this.redis.set('product-one'+id, JSON.stringify(res))
      }
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
        return cachTopProducts;
      }
      const response: any[] =
        await this.parserService.getTopProducts();
      const serializeTopProducts = response.map((item) => ({
        itemNo: item.itemNo,
        brand: item.brand,
        quantity: item.quantity,
        description: item.description,
        searchDescription: item.searchDescription,
        inStock: item.inStock,
        firstPic: normalizeImagePath(item.firstPic as string) as string,
        criteriaLine: item.criteriaLine,
        retail: item.retail,
        price: markupPercentPrice(item.price),
        salesUoM: item.salesUoM,
        criterias: item.criterias,
        longText: item.longText,
        groupCode: item.groupCode,
        subGroupCode: item.subGroupCode,
        stock: normalizeStock(item.stock, adminConfig.autotechsnicsCity),
      }))
      if(!response){
        this.redis.set('top-products', JSON.stringify(serializeTopProducts));
      }
      return serializeTopProducts;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
