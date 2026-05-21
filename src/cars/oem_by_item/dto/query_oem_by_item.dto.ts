import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString } from "class-validator";

export class QueryOemByItemDto {
    @ApiPropertyOptional({
        description: 'ID товара',
        example: "FS 333-926",
    })
    @Type(() => String)
    @IsString()

    id!: string;
}