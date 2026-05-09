import { IsInt, IsOptional, Min } from "class-validator";
import { Type } from "class-transformer";

export class paginationDto {
    @IsOptional()
    @IsInt()
    @Type(()=>Number)
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @IsInt()
    @Type(()=>Number)
    @Min(1)
    limit?: number = 5;
}