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
    @IsInt()
    @Min(1)
    "quantity": number;
}