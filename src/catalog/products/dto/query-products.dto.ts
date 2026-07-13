import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/shared/common/pagination/dto/pagination-query-dto';

export class QueryProductDto extends PaginationDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    typeId!: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    groupId!: number;
}