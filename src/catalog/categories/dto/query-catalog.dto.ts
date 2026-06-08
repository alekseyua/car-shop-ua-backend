import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber } from "class-validator";
import { PaginationDto } from "src/shared/common/pagination/dto/pagination-query-dto";

export class QueryCatalogDto extends PaginationDto {
    @ApiProperty({
        example: 3333,
        required: true,
        description: 'type id modification'
    })
    @Type(()=>Number)
    @IsNumber()
    "typeAutotechId": number;
}