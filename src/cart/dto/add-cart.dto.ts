import {
    IsInt,
    IsString,
    Min,
    IsOptional,
    IsNumber,
} from 'class-validator';

export class AddToCartDto {
    @IsString()
    "itemNo": string;
    @IsInt()
    @Min(1)
    "quantity": number;
}