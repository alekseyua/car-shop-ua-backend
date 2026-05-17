import { Injectable } from '@nestjs/common';
import { CreateItemsCatalogDto } from './dto/create-items_catalog.dto';
import { ParserService } from 'src/parser/parser.service';
import { QueryItemsCatalogDto } from './dto/query-items_catalog.dto';
import { ProductDetailResponse, ResponseItemCatalogDto, ResponseParserItemsCatalogDto } from './dto/response-items_catalog.dto';

@Injectable()
export class ItemsCatalogService {
  constructor(private parserService: ParserService) { }

  async findAll(dto: QueryItemsCatalogDto): Promise<ResponseItemCatalogDto[]> {
    try {
      const { typeId, groupId } = dto;
      const getItemsCatalog: ResponseParserItemsCatalogDto[] = await this.parserService.getItemsCatalog(typeId, groupId);
      // console.log(getItemsCatalog[0], getItemsCatalog.length);
      return getItemsCatalog.map(item => ({
        itemNo: item.itemNo,
        brand: item.brand,
        quantity: item.quantity,
        description: item.description,
        searchDescription: item.searchDescription,
        inStock: item.inStock,
        firstPic: item.firstPic,
        criteriaLine: item.criteriaLine,
        retail: item.retail,
        price: item.price,
        salesUoM: item.salesUoM,
        criterias: item.criterias,
        stock: JSON.parse(item.stock)
      }));
    } catch (error) {
      console.log(error);
      throw error;
    }
    //getItemsCatalog
  }

  // getItemDetails
  async findOne(id: string): Promise<ProductDetailResponse> {
    try {
      const response: ProductDetailResponse = await this.parserService.getItemDetails(id);
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

      const res: ProductDetailResponse = {
        ...response,
        item: {
          ...response.item,
          stock: JSON.parse(response.item.stock)
        }
      };
      return res;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
