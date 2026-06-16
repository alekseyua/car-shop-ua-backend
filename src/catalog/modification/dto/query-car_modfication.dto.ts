import { Type } from "class-transformer";
import { IsInt } from "class-validator";
import { PaginationDto } from "src/shared/common/pagination/dto/pagination-query-dto";

export class QueryCarModificationDto extends PaginationDto {
    @Type(() => Number)
    @IsInt()
    "modelId": number;
}