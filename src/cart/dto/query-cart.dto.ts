import { IsOptional, IsString } from "class-validator";

export class CheckoutDto {
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
}