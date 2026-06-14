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
  normalizeStock,
} from 'src/shared/common/helpers/helpers';
import { adminConfig } from 'src/core/config/admin.config';

@Injectable()
export class ProductsService {
  constructor(private parserService: ParserService) {}

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
        firstPic: item.firstPic,
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
      return res;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // getListTopProducts
  async getListTopProducts(): Promise<ResponseProductDto[]> {
    try {
      const response: any[] =
        await this.parserService.getTopProducts();

      return response.map((item) => ({
        itemNo: item.itemNo,
        brand: item.brand,
        quantity: item.quantity,
        description: item.description,
        searchDescription: item.searchDescription,
        inStock: item.inStock,
        firstPic: item.firstPic,
        criteriaLine: item.criteriaLine,
        retail: item.retail,
        price: markupPercentPrice(item.price),
        salesUoM: item.salesUoM,
        criterias: item.criterias,
        longText: item.longText,
        groupCode: item.groupCode,
        subGroupCode: item.subGroupCode,
        stock: normalizeStock(item.stock, adminConfig.autotechsnicsCity),
      }));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
