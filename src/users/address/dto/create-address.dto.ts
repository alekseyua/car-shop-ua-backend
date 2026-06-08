import {
    IsString,
    IsOptional,
} from 'class-validator';

export class CreateAddressDto {
    @IsString()
    "country": string;

    @IsString()
    "city": string;

    @IsString()
    "street": string;

    @IsString()
    "house": string;

    @IsOptional()
    @IsString()
    "apartment"?: string;

    @IsOptional()
    @IsString()
    "postalCode"?: string;

    @IsOptional()
    "isDefault"?: boolean;
}