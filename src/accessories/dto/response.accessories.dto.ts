import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { ResponseStockDto } from 'src/shared/common/helpers/types';
import { PaginationDto } from 'src/shared/common/pagination/dto/pagination-query-dto';

export class AccessoryCategoryDto {
  @ApiProperty({
    example: 15,
    description: 'ID каталога/компании',
  })
  'comId': number;

  @ApiProperty({
    example: 10,
    description: 'Порядок сортировки',
  })
  'sort': number;

  @ApiProperty({
    example: 15,
    description: 'ID категории',
  })
  'id': number;

  @ApiProperty({
    example: 0,
    description: 'ID родительской категории',
  })
  'parentId': number;

  @ApiProperty({
    example: 4,
    description: 'Количество колонок',
  })
  'col': number;

  @ApiProperty({
    example: true,
  })
  'active': boolean;

  @ApiProperty({
    example: '15/15.jpg',
  })
  'img': string;

  @ApiProperty({
    example: 'Аксесуари',
  })
  'title': string;

  @ApiProperty({
    example: '',
    required: false,
  })
  'itemGroup': string;

  @ApiProperty({
    example: '',
    required: false,
  })
  'itemSubGroup': string;

  @ApiProperty({
    type: () => [AccessoryCategoryDto],
    description: 'Дочерние категории',
  })
  'childElements': AccessoryCategoryDto[];
}

export class ProductAccessoriesDto {
  @ApiProperty({ example: false })
  'blockSalesReturn': boolean;

  @ApiProperty({ example: 'OSRAM' })
  'brand': string;

  @ApiProperty({ example: false })
  'checkSend': boolean;

  @ApiProperty({ example: 15 })
  'comId': number;

  @ApiProperty({
    example:
      'Довжина зі штекером: 350 см, Поперечний переріз [мм?]: 25 мм?, Піковий струм: 700 А, так ',
    nullable: true,
  })
  'criteriaLine': string | null;

  @ApiProperty({
    example: [],
    type: 'array',
  })
  'criterias': unknown[];

  @ApiProperty({
    example: 'Кабель для запуску автомобіля',
  })
  'description': string;

  @ApiProperty({ example: 'ES1' })
  'discGroup': string;

  @ApiProperty({ example: false })
  'discontinued': boolean;

  @ApiProperty({
    example: 'tcd-com/15000/OSOSC250-1.jpg?46247170',
    nullable: true,
  })
  'firstPic': string | null;

  @ApiProperty({
    example: 'Автомобільні аксесуари',
  })
  'groupCode': string;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  inAction: unknown;

  @ApiProperty({ example: true })
  'inStock': boolean;

  @ApiProperty({ example: 1.2 })
  'increaseFactor': number;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  isEntry: unknown;

  @ApiProperty({
    example: 'OS OSC250',
  })
  'itemNo': string;

  @ApiProperty({
    example: '0',
  })
  'itemNo2': string;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  'longText': string | null;

  @ApiProperty({
    example: 1230.78,
  })
  'price': number;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  'probablyDatePrih': string | null;

  @ApiProperty({
    example: 0,
  })
  'probablyDatePrihDiff': number;

  @ApiProperty({
    example: 0,
  })
  'quantity': number;

  @ApiProperty({
    example: true,
  })
  'replaceExist': boolean;

  @ApiProperty({
    example: 2017.67,
  })
  'retail': number;

  @ApiProperty({
    example: '',
  })
  'sBrand': string;

  @ApiProperty({
    example: '',
  })
  'sCode': string;

  @ApiProperty({
    example: 1,
  })
  'salesOrderMultiple': number;

  @ApiProperty({
    example: 'К-Т',
  })
  'salesUoM': string;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  'search': string | null;

  @ApiProperty({
    example:
      'ПУСКОВИЙ КАБЕЛЬ 12/24V 700A 3.5М / АЛЮМІНІЙ З МІДНИМ ПОКРИТТЯМ / ДЛЯ БЕНЗИНОВИХ ТА ДИЗЕЛЬНИХ ДВИГУНІВ ДО 5.5L',
  })
  'searchDescription': string;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  'shortText': string | null;

  @ApiProperty({
    example: 1,
  })
  'sort': number;

  @ApiProperty({
    example: '{"Stock":[{"L":"КрРіг","C":"КРР1","Q":"0","R":0}]}',
  })
  'stock': string;

  @ApiProperty({
    example: 'Кабелі для запуску автомобіля',
  })
  'subGroupCode': string;

  @ApiProperty({
    example: 0,
  })
  'summ': number;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  'weight': number | null;
}

export class ResponseProductAccessoriesDto {
  @ApiProperty({ example: false })
  'blockSalesReturn': boolean;

  @ApiProperty({ example: 'OSRAM' })
  'brand': string;

  @ApiProperty({ example: false })
  'checkSend': boolean;

  @ApiProperty({ example: 15 })
  'comId': number;

  @ApiProperty({
    example:
      'Довжина зі штекером: 350 см, Поперечний переріз [мм?]: 25 мм?, Піковий струм: 700 А, так ',
    nullable: true,
  })
  'criteriaLine': string | null;

  @ApiProperty({
    example: [],
    type: 'array',
  })
  'criterias': unknown[];

  @ApiProperty({
    example: 'Кабель для запуску автомобіля',
  })
  'description': string;

  @ApiProperty({ example: 'ES1' })
  'discGroup': string;

  @ApiProperty({ example: false })
  'discontinued': boolean;

  @ApiProperty({
    example: 'tcd-com/15000/OSOSC250-1.jpg?46247170',
    nullable: true,
  })
  'firstPic': string | null;

  @ApiProperty({
    example: 'Автомобільні аксесуари',
  })
  'groupCode': string;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  'inAction': unknown;

  @ApiProperty({ example: true })
  'inStock': boolean;

  @ApiProperty({ example: 1.2 })
  'increaseFactor': number;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  'isEntry': unknown;

  @ApiProperty({
    example: 'OS OSC250',
  })
  'itemNo': string;

  @ApiProperty({
    example: '0',
  })
  'itemNo2': string;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  'longText': string | null;

  @ApiProperty({
    example: 1230.78,
  })
  'price': number;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  'probablyDatePrih': string | null;

  @ApiProperty({
    example: 0,
  })
  'probablyDatePrihDiff': number;

  @ApiProperty({
    example: 0,
  })
  'quantity': number;

  @ApiProperty({
    example: true,
  })
  'replaceExist': boolean;

  @ApiProperty({
    example: 2017.67,
  })
  'retail': number;

  @ApiProperty({
    example: '',
  })
  'sBrand': string;

  @ApiProperty({
    example: '',
  })
  'sCode': string;

  @ApiProperty({
    example: 1,
  })
  'salesOrderMultiple': number;

  @ApiProperty({
    example: 'К-Т',
  })
  'salesUoM': string;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  'search': string | null;

  @ApiProperty({
    example:
      'ПУСКОВИЙ КАБЕЛЬ 12/24V 700A 3.5М / АЛЮМІНІЙ З МІДНИМ ПОКРИТТЯМ / ДЛЯ БЕНЗИНОВИХ ТА ДИЗЕЛЬНИХ ДВИГУНІВ ДО 5.5L',
  })
  'searchDescription': string;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  'shortText': string | null;

  @ApiProperty({
    example: 1,
  })
  'sort': number;

  @ApiProperty({
    example: '{"Stock":[{"L":"КрРіг","C":"КРР1","Q":"0","R":0}]}',
  })
  'stock': ResponseStockDto[];

  @ApiProperty({
    example: 'Кабелі для запуску автомобіля',
  })
  'subGroupCode': string;

  @ApiProperty({
    example: 0,
  })
  'summ': number;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  'weight': number | null;
}

export class QueryCatalogAccessoriesDto extends PaginationDto {
  @ApiProperty({
    example: 95,
    required: true,
    description: 'type id',
  })
  @Type(() => Number)
  @IsNumber()
  'id': number;
}
