import { ApiPropertyOptional } from "@nestjs/swagger";
import { PaginationDto } from "src/shared/common/pagination/dto/pagination-query-dto";

export class QueryProductDto extends PaginationDto {
    @ApiPropertyOptional({
        example: 1054,
        description: 'ID типа каталога',
    })
    "typeId": number;
    @ApiPropertyOptional({
        example: 2036,
        description: 'ID группы каталога',
    })
    "groupId": number;
}