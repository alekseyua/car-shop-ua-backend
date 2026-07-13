import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateGarageCarDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    garageId?: number;

    @Type(() => Number)
    @IsInt()
    modificationId!: number;

    @IsOptional()
    @IsString()
    vin?: string;

    @IsOptional()
    @IsString()
    nickname?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    mileage?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    year?: number;

    @IsOptional()
    @IsString()
    color?: string;
}