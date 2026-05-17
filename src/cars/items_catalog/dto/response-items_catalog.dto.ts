import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CriteriaDto {
    @ApiProperty()
    "itemNo": string;

    @ApiProperty()
    "criteria": string;

    @ApiProperty()
    "value": string;
}

class StockItemDto {
    @ApiProperty()
    "L": string;

    @ApiProperty()
    "C": string;

    @ApiProperty()
    "Q": string;

    @ApiProperty()
    "R": number;
}

class StockDto {
    @ApiProperty({ type: [StockItemDto] })
    "Stock": StockItemDto[];
}

export class ResponseParserItemsCatalogDto {
    @ApiProperty()
    "comId": number;

    @ApiProperty()
    "itemNo": string;

    @ApiProperty()
    "brand": string;

    @ApiProperty()
    "quantity": number;

    @ApiProperty()
    "description": string;

    @ApiProperty()
    "searchDescription": string;

    @ApiPropertyOptional()
    "longText": string | null;

    @ApiPropertyOptional()
    "shortText": string | null;

    @ApiProperty()
    "discGroup": string;

    @ApiPropertyOptional()
    "weight": number | null;

    @ApiProperty()
    "replaceExist": boolean;

    @ApiPropertyOptional()
    "isEntry": boolean | null;

    @ApiProperty()
    "inStock": boolean;

    @ApiPropertyOptional()
    "search": string | null;

    @ApiProperty()
    "sCode": string;

    @ApiProperty()
    "sBrand": string;

    @ApiProperty()
    "sort": number;

    @ApiProperty()
    "firstPic": string;

    @ApiProperty()
    "criteriaLine": string;

    @ApiProperty()
    "retail": number;

    @ApiProperty()
    "price": number;

    @ApiProperty({
        description: 'JSON string of stock object'
    })
    "stock": string;

    @ApiPropertyOptional()
    "inAction": boolean | null;

    @ApiProperty()
    "groupCode": string;

    @ApiProperty()
    "subGroupCode": string;

    @ApiProperty()
    "discontinued": boolean;

    @ApiProperty()
    "salesUoM": string;

    @ApiProperty()
    "summ": number;

    @ApiProperty()
    "increaseFactor": number;

    @ApiProperty()
    "itemNo2": string;

    @ApiProperty()
    "salesOrderMultiple": number;

    @ApiProperty()
    "blockSalesReturn": boolean;

    @ApiProperty({ type: [CriteriaDto] })
    "criterias": CriteriaDto[];

    @ApiPropertyOptional()
    "probablyDatePrih": string | null;

    @ApiProperty()
    "probablyDatePrihDiff": number;

    @ApiProperty()
    "checkSend": boolean;
}

export class ResponseItemCatalogDto { 
    @ApiProperty() 
    "itemNo": string; 
    @ApiProperty() 
    "brand": string; 
    @ApiProperty() 
    "quantity": number; 
    @ApiProperty() 
    "description": string; 
    @ApiProperty() 
    "searchDescription": string; 
    @ApiProperty() 
    "inStock": boolean; 
    @ApiProperty() 
    "firstPic": string; 
    @ApiProperty() 
    "criteriaLine": string; 
    @ApiProperty() 
    "retail": number; 
    @ApiProperty() 
    "price": number; 
    @ApiProperty() 
    "salesUoM": string; 
    @ApiProperty({ type: [CriteriaDto], }) 
    "criterias": CriteriaDto[]; 
    @ApiProperty({ type: StockDto, }) 
    "stock": StockDto; 
}



export class ProductItem {
    @ApiProperty()
    "comId": number;
    @ApiProperty()
    "itemNo": string;
    @ApiProperty()
    "brand": string;
    @ApiProperty()
    "quantity": number;
    @ApiProperty()
    "description": string;
    @ApiProperty()
    "searchDescription": string;
    @ApiPropertyOptional()
    "longText": string | null;
    @ApiPropertyOptional()
    "shortText": string | null;
    @ApiProperty()
    "discGroup": string;
    @ApiPropertyOptional()
    "weight": number | null;
    @ApiProperty()
    "replaceExist": boolean;
    @ApiPropertyOptional()
    "isEntry": boolean | null;
    @ApiProperty()
    "inStock": boolean;
    @ApiPropertyOptional()
    "search": string | null;
    @ApiProperty()
    "sCode": string;
    @ApiProperty()
    "sBrand": string;
    @ApiProperty()
    "sort": number;
    @ApiProperty()
    "firstPic": string;
    @ApiProperty()
    "criteriaLine": string;
    @ApiProperty()
    "retail": number;
    @ApiProperty()
    "price": number;
    @ApiProperty({
        description: 'JSON string of stock object'
    })
    "stock": string;
    @ApiPropertyOptional()
    "inAction": boolean | null;
    @ApiProperty()
    "groupCode": string;
    @ApiProperty()
    "subGroupCode": string;
    @ApiProperty()
    "discontinued": boolean;
    @ApiProperty()
    "salesUoM": string;
    @ApiProperty()
    "summ": number;
    @ApiProperty()
    "increaseFactor": number;
    @ApiProperty()
    "itemNo2": string;
    @ApiProperty()
    "salesOrderMultiple": number;
    @ApiProperty()
    "blockSalesReturn": boolean;
    @ApiProperty({ type: [CriteriaDto] })
    "criterias": CriteriaDto[];
    @ApiPropertyOptional()
    "probablyDatePrih": string | null;
    @ApiProperty()
    "probablyDatePrihDiff": number;
    @ApiProperty()
    "checkSend": boolean;
}

export class ProductCriteria {
    @ApiProperty()
    "itemNo": string;
    @ApiProperty()
    "criteria": string;
    @ApiProperty()
    "value": string;
}

export class ProductFile {
    @ApiProperty()
    "comID": string;
    @ApiProperty()
    "itemNo": string;
    @ApiProperty()
    "sort": string;
    @ApiProperty()
    "manual": string;
    @ApiProperty()
    "pathName": string;
    @ApiProperty()
    "fileName": string;
    @ApiProperty()
    "url": string;
    @ApiProperty()
    "fileType": string;
    @ApiProperty()
    "fileDescript": string;
}
export class ProductDetailResponse {
    @ApiProperty({ type: () => ProductItem })
    "item": ProductItem;
    @ApiProperty({ type: () => [ProductItem] })
    "replaces": ProductItem[];
    @ApiProperty()
    "pictures": string[];
    @ApiProperty({ type: () => [ProductFile] })
    "files": ProductFile[];
}