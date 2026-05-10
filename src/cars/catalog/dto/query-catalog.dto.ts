import { ApiProperty } from "@nestjs/swagger";
import { PaginationDto } from "src/shared/common/pagination/dto/pagination-query-dto";

export class QueryCatalogDto extends PaginationDto {
    @ApiProperty({
        example: '3333',
        description: 'type id modification'
    })
    "typeId": number;
}