import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeliveryStatus } from 'src/shared/common/helpers/types';

class CriteriaDto {
  @ApiProperty()
  'itemNo': string;

  @ApiProperty()
  'criteria': string;

  @ApiProperty()
  'value': string;
}

// class StockItemDto {
//   @ApiProperty()
//   'L': string;

//   @ApiProperty()
//   'C': string;

//   @ApiProperty()
//   'Q': string;

//   @ApiProperty()
//   'R': number;
// }

export class ResponseParserProductDto {
  @ApiProperty()
  'comId': number;

  @ApiProperty()
  'itemNo': string;

  @ApiProperty()
  'brand': string;

  @ApiProperty()
  'quantity': number;

  @ApiProperty()
  'description': string;

  @ApiProperty()
  'searchDescription': string;

  @ApiPropertyOptional()
  'longText': string | null;

  @ApiPropertyOptional()
  'shortText': string | null;

  @ApiProperty()
  'discGroup': string;

  @ApiPropertyOptional()
  'weight': number | null;

  @ApiProperty()
  'replaceExist': boolean;

  @ApiPropertyOptional()
  'isEntry': boolean | null;

  @ApiProperty()
  'inStock': boolean;

  @ApiPropertyOptional()
  'search': string | null;

  @ApiProperty()
  'sCode': string;

  @ApiProperty()
  'sBrand': string;

  @ApiProperty()
  'sort': number;

  @ApiProperty()
  'firstPic': string;

  @ApiProperty()
  'criteriaLine': string;

  @ApiProperty()
  'retail': number;

  @ApiProperty()
  'price': number;

  @ApiProperty({
    description: 'JSON string of stock object',
  })
  'stock': string;

  @ApiPropertyOptional()
  'inAction': boolean | null;

  @ApiProperty()
  'groupCode': string;

  @ApiProperty()
  'subGroupCode': string;

  @ApiProperty()
  'discontinued': boolean;

  @ApiProperty()
  'salesUoM': string;

  @ApiProperty()
  'summ': number;

  @ApiProperty()
  'increaseFactor': number;

  @ApiProperty()
  'itemNo2': string;

  @ApiProperty()
  'salesOrderMultiple': number;

  @ApiProperty()
  'blockSalesReturn': boolean;

  @ApiProperty({ type: [CriteriaDto] })
  'criterias': CriteriaDto[];

  @ApiPropertyOptional()
  'probablyDatePrih': string | null;

  @ApiProperty()
  'probablyDatePrihDiff': number;

  @ApiProperty()
  'checkSend': boolean;
}
class ResponseStockDto {
  @ApiProperty()
  'isStock': boolean;
  @ApiProperty()
  'quantity': number;
  @ApiProperty()
  'statusDelivery': DeliveryStatus;
}
export class ResponseProductDto {
  @ApiProperty()
  'itemNo': string;
  @ApiProperty()
  'brand': string;
  @ApiProperty()
  'quantity': number;
  @ApiProperty()
  'description': string;
  @ApiProperty()
  'searchDescription': string;
  @ApiProperty()
  'inStock': boolean;
  @ApiProperty()
  'firstPic': string;
  @ApiProperty()
  'criteriaLine': string;

  @ApiProperty()
  'longText'?: string;
  @ApiProperty()
  'groupCode'?: string;
  @ApiProperty()
  'subGroupCode'?: string;
  
  @ApiProperty()
  'retail': number;
  @ApiProperty()
  'price': number;
  @ApiProperty()
  'salesUoM': string;
  @ApiProperty({ type: () => [CriteriaDto] })
  'criterias': CriteriaDto[];
  @ApiProperty({ type: () => [ResponseStockDto] })
  'stock': ResponseStockDto[];
}

// detail product
export class ProductItem {
  @ApiProperty()
  'comId': number;
  @ApiProperty()
  'itemNo': string;
  @ApiProperty()
  'brand': string;
  @ApiProperty()
  'quantity': number;
  @ApiProperty()
  'description': string;
  @ApiProperty()
  'searchDescription': string;
  @ApiPropertyOptional()
  'longText': string | null;
  @ApiPropertyOptional()
  'shortText': string | null;
  @ApiProperty()
  'discGroup': string;
  @ApiPropertyOptional()
  'weight': number | null;
  @ApiProperty()
  'replaceExist': boolean;
  @ApiPropertyOptional()
  'isEntry': boolean | null;
  @ApiProperty()
  'inStock': boolean;
  @ApiPropertyOptional()
  'search': string | null;
  @ApiProperty()
  'sCode': string;
  @ApiProperty()
  'sBrand': string;
  @ApiProperty()
  'sort': number;
  @ApiProperty()
  'firstPic': string;
  @ApiProperty()
  'criteriaLine': string;
  @ApiProperty()
  'retail': number;
  @ApiProperty()
  'price': number;
  @ApiProperty({
    description: 'JSON string of stock object',
  })
  'stock': ResponseStockDto[] | string;
  @ApiPropertyOptional()
  'inAction': boolean | null;
  @ApiProperty()
  'groupCode': string;
  @ApiProperty()
  'subGroupCode': string;
  @ApiProperty()
  'discontinued': boolean;
  @ApiProperty()
  'salesUoM': string;
  @ApiProperty()
  'summ': number;
  @ApiProperty()
  'increaseFactor': number;
  @ApiProperty()
  'itemNo2': string;
  @ApiProperty()
  'salesOrderMultiple': number;
  @ApiProperty()
  'blockSalesReturn': boolean;
  @ApiProperty({ type: [CriteriaDto] })
  'criterias': CriteriaDto[];
  @ApiPropertyOptional()
  'probablyDatePrih': string | null;
  @ApiProperty()
  'probablyDatePrihDiff': number;
  @ApiProperty()
  'checkSend': boolean;
}

export class ProductCriteria {
  @ApiProperty()
  'itemNo': string;
  @ApiProperty()
  'criteria': string;
  @ApiProperty()
  'value': string;
}

export class ProductFile {
  @ApiProperty()
  'comID': string;
  @ApiProperty()
  'itemNo': string;
  @ApiProperty()
  'sort': string;
  @ApiProperty()
  'manual': string;
  @ApiProperty()
  'pathName': string;
  @ApiProperty()
  'fileName': string;
  @ApiProperty()
  'url': string;
  @ApiProperty()
  'fileType': string;
  @ApiProperty()
  'fileDescript': string;
}
export class ResponseProductDetailDto {
  @ApiProperty({
    type: () => ProductItem,
    nullable: true,
  })
  'item': ProductItem | null;
  @ApiProperty({
    type: () => [ProductItem],
    nullable: true,
  })
  'replaces': ProductItem[] | null;
  @ApiProperty({
    nullable: true,
  })
  'pictures': string[] | null;
  @ApiProperty({
    type: () => [ProductFile],
    nullable: true,
  })
  'files': ProductFile[] | null;
}
