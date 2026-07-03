import { IsOptional, IsString } from "class-validator";

export class CheckoutDto {
    @IsString()
    "deliveryCity": string;

    @IsString()
    "deliveryPhone": string;

    @IsOptional()
    @IsString()
    "deliveryEmail": string;

    @IsString()
    "deliveryLastname": string;

    @IsOptional()
    @IsString()
    "deliveryFirstname": string;

    @IsOptional()
    @IsString()
    "deliveryMiddlename": string;

    @IsOptional()
    @IsString()
    "deliveryComment": string;

    @IsOptional()
    @IsString()
    "deliveryVin": string;

    @IsOptional()
    @IsString()
    "deliveryPoint": string;

    @IsOptional()
    @IsString()
    "deliveryPointRef": string;

    @IsOptional()
    @IsString()
    "deliveryStreet": string;

    @IsString()
    "deliveryHouse": string;

    @IsOptional()
    @IsString()
    "deliveryApartment"?: string;

}