import { Injectable } from '@nestjs/common';
import { QueryOemByItemDto } from './dto/query_oem_by_item.dto';
import { ParserService } from 'src/integrations/parser/parser.service';
import { ResponseOemByItemDto } from './dto/response_oem_by_item.dto';
import { CreateOemByItemDto } from './dto/create_oem_by_item.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { normalizeString } from 'src/shared/common/helpers/helpers';

@Injectable()
export class OemService {
  constructor(
    private readonly parser: ParserService,
    private readonly prisma: PrismaService,
  ) {}
  async create(createOemByItemDto: CreateOemByItemDto[]) {
    await this.prisma.listOEMByItem.createMany({
      data: createOemByItemDto.map((item)=>({
        ...item,
        itemNo: normalizeString(item.itemNo),
      }))
    })
    return 'This action adds a new oemByItem';
  }

  // findAll() {
  //   return `This action returns all oemByItem`;
  // }

  async findOne({ id }: QueryOemByItemDto): Promise<ResponseOemByItemDto[]> {
    try {
      const oemByItems = await this.prisma.listOEMByItem.findMany({
        where: {
          itemNo: normalizeString(id),
        }
      })
      if(oemByItems.length > 0) {
        console.log('from base')
        return oemByItems;
      }else{

        const resParser: ResponseOemByItemDto[] = await this.parser.getListItemOem((id));
        if(resParser.length > 0) {
          await this.create(resParser);
        }
        console.log('from resParser');
        return resParser;
      }
    } catch (error: Error | any) {
      throw new Error(`Failed to find oem by item with ID ${id}: ${error.message}`);
    }
  }

  // update(id: number, updateOemByItemDto: UpdateOemByItemDto) {
  //   return `This action updates a #${id} oemByItem`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} oemByItem`;
  // }
}
