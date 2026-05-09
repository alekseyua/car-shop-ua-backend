import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber } from "class-validator";
import { PaginationDto } from "src/shared/common/pagination/dto/pagination-query-dto";

export class QueryCarModelDto extends PaginationDto{
    @Type(() => Number)
    @IsNumber()
    @ApiProperty({
        example: '1',
        description: 'Brand id'
    })
    "brandId": Number;
}