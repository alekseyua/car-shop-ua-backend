import {
    IsArray,
    IsInt,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateOrderItemDto {
    @IsString()
    "itemNo": string;

    @IsString()
    "title": string;

    @IsInt()
    @Min(1)
    "quantity": number;

    "price": number;

    @IsOptional()
    @IsString()
    "imageUrl"?: string;
}

export class CreateOrderDto {
    @IsString()
    "deliveryCountry": string;

    @IsString()
    "deliveryCity": string;

    @IsString()
    "deliveryStreet": string;

    @IsString()
    "deliveryHouse": string;

    @IsOptional()
    @IsString()
    "deliveryApartment"?: string;

    @IsOptional()
    @IsString()
    "deliveryPostalCode"?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    "items": CreateOrderItemDto[];
}