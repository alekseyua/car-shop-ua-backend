import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { QueryProductDto } from './dto/query-products.dto';
import {
  ResponseProductDetailDto,
  ResponseProductDto,
} from './dto/response-products.dto';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller()
export class ProductController {
  constructor(private readonly ProductsService: ProductsService) {}

  @ApiOkResponse({
    type: [ResponseProductDto],
    description: 'Список товаров успешно получен',
  })
  @Get('products')
  findAll(
    @Query() dto: QueryProductDto,
  ): Promise<ResponseProductDto[]> {
    console.log(dto);
    return this.ProductsService.findAll(dto);
  }

  @ApiOkResponse({
    type: ResponseProductDetailDto,
  })
  @Get('product/:id')
  findOne(@Param('id') id: string): Promise<ResponseProductDetailDto> {
    return this.ProductsService.findOne(id);
  }

  @Get('products/top')
  getListTopProducts(): Promise<ResponseProductDto[]> {
    return this.ProductsService.getListTopProducts();
  }
}
