import { ApiProperty } from '@nestjs/swagger';

export class RedisSearchResult {
  'itemNo': string;
  'name': string;
  'price': string;
  'catItemNo': string;
}

export class SearchResultResponse {
  'total': number;
  'products': RedisSearchResult[];
}

// Kroon Oil
export class CarItemDto {
  @ApiProperty({
    example: 'Volkswagen (VW) (EU) Golf VII 5G1 Golf VII 1.5 TSI (96 kW)',
  })
  'title': string;

  @ApiProperty({
    example: '2017 - 2019',
  })
  'years': string;

  @ApiProperty({
    example:
      '/en/int/product-recommendation/cars/volkswagen-vw-eu/golf-vii-5g1/golf-vii-1-5-tsi-96-kw/76187/',
  })
  'url': string;

  @ApiProperty({
    example: 76187,
  })
  'id': number;
}

export class CarCategoryDto {
  @ApiProperty({
    example: 'Cars',
  })
  'title': string;

  @ApiProperty({
    type: [CarItemDto],
  })
  'items': CarItemDto[];
}

export class ProductRecommendationDto {
  @ApiProperty({
    type: [CarCategoryDto],
  })
  'categories': CarCategoryDto[];
}

export class RecommendationProductDto {
  @ApiProperty({
    example: 'Helar SP LL-03 0W-30',
  })
  'title': string;

  @ApiProperty({
    example: '/en/int/helar-sp-ll-03-0w-30-12-x-1-l-bottle-37464/',
  })
  'url': string;

  @ApiProperty({
    example: 0,
  })
  'id': number;

  @ApiProperty({
    example: '31071',
  })
  'kroonCode': string;

  @ApiProperty({
    example: 'KL31071',
  })
  'code': string;
}

export class RecommendationComponentDto {
  @ApiProperty({
    example: 'Engine DHFA',
  })
  'title': string;

  @ApiProperty({
    type: [RecommendationProductDto],
  })
  'products': RecommendationProductDto[];

  @ApiProperty({
    example: '4,3 liter (Service fill)',
  })
  'volume': string;

  @ApiProperty({
    example: 'Change 15000 km/ 12 months',
  })
  'replacement': string;
}

export class CarRecommendationDto {
  @ApiProperty({
    example: 92423,
  })
  'id': number;

  @ApiProperty({
    example: 'Volkswagen (VW) (EU) Golf VII 5G1 Golf VII 1.5 TGI (96 kW)',
  })
  'title': string;

  @ApiProperty({
    example: '2019 - 2020',
  })
  'years': string;

  @ApiProperty({
    type: [RecommendationComponentDto],
  })
  'components': RecommendationComponentDto[];
}
