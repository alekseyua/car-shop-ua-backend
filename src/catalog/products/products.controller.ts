import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { QueryProductDto } from './dto/query-products.dto';
import {
  NormalizeProductItem,
  NormalizeResponseProductDetailDto,
} from './dto/response-products.dto';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller()
export class ProductController {
  constructor(private readonly ProductsService: ProductsService) {}

  @ApiOkResponse({
    type: [NormalizeProductItem],
    description: 'Список товаров успешно получен',
  })
  @Get('products')
  findAll(@Query() dto: QueryProductDto): Promise<NormalizeProductItem[]> {
    return this.ProductsService.findAll(dto);
  }

  @ApiOkResponse({
    type: NormalizeResponseProductDetailDto,
  })
  @Get('product/:id')
  findOne(@Param('id') id: string): Promise<NormalizeResponseProductDetailDto> {
    return this.ProductsService.findOne(id);
  }

  @Get('products/top')
  @ApiOkResponse({
    type: [NormalizeProductItem],
    description: 'Список товаров успешно получен',
  })
  getListTopProducts(): Promise<NormalizeProductItem[]> {
    return this.ProductsService.getListTopProducts();
  }
}
