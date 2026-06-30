import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class QueryCitiesDto {
    @ApiProperty({
        example: 'Дніпро',

    })
    @IsString()
    "city": string;
}