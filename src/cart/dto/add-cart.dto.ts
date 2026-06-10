import {
    IsInt,
    IsString,
    Min,
    IsOptional,
    IsNumber,
} from 'class-validator';

export class AddToCartDto {
    @IsString()
    "productId": string;

    @IsString()
    "title": string;

    @IsNumber()
    "price": number;

    @IsOptional()
    @IsString()
    "imageUrl"?: string;

    @IsInt()
    @Min(1)
    "quantity": number;
}