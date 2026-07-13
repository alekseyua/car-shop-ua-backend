import { ApiOperation, ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateGarageDto {
  @ApiProperty({
    name: 'name',
    example:"My bigget garage"
  })
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
