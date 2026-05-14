import { Injectable } from '@nestjs/common';
import { CreateItemsCatalogDto } from './dto/create-items_catalog.dto';
import { UpdateItemsCatalogDto } from './dto/update-items_catalog.dto';
import { ParserService } from 'src/parser/parser.service';
import { QueryItemsCatalogDto } from './dto/query-items_catalog.dto';
import { ResponseItemCatalogDto, ResponseParserItemsCatalogDto } from './dto/response-items_catalog.dto';

@Injectable()
export class ItemsCatalogService {
  constructor(private parserService: ParserService) { }
  create(createItemsCatalogDto: CreateItemsCatalogDto) {
    return 'This action adds a new itemsCatalog';
  }

  async findAll(dto: QueryItemsCatalogDto): Promise<ResponseItemCatalogDto[]> {
    try{
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
    }catch(error){
        console.log(error);
        throw error;  
    }
    //getItemsCatalog
  }

  findOne(id: number) {
    return `This action returns a #${id} itemsCatalog`;
  }

  update(id: number, updateItemsCatalogDto: UpdateItemsCatalogDto) {
    return `This action updates a #${id} itemsCatalog`;
  }

  remove(id: number) {
    return `This action removes a #${id} itemsCatalog`;
  }
}
