import { Injectable } from '@nestjs/common';
import { ParserService } from 'src/parser/parser.service';
import { QueryItemsCatalogDto } from './dto/query-items_catalog.dto';
import {
  ResponseProductDetailDto,
  ResponseItemCatalogDto,
  ResponseParserItemsCatalogDto,
  ProductItem,
} from './dto/response-items_catalog.dto';
import {
  markupPercentPrice,
  normalizeStock,
} from 'src/shared/common/helpers/helpers';
import { adminConfig } from 'src/core/config/admin.config';

@Injectable()
export class ItemCatalogService {
  constructor(private parserService: ParserService) {}

  async findAll(dto: QueryItemsCatalogDto): Promise<ResponseItemCatalogDto[]> {
    try {
      const { typeId, groupId } = dto;
      const getItemsCatalog: ResponseParserItemsCatalogDto[] =
        await this.parserService.getItemsCatalog(typeId, groupId);
      // console.log(getItemsCatalog[0], getItemsCatalog.length);
      return getItemsCatalog.map((item) => ({
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
    //getItemsCatalog
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
}
