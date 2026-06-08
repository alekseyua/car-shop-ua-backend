import {
    IsEmail,
    IsOptional,
    IsString,
    MinLength,
    IsDateString,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty()
    @IsString()
    "lastName": string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    "firstName"?: string;

    @ApiPropertyOptional({
        example: '1995-05-15',
    })
    @IsOptional()
    @IsDateString()
    "birthDate"?: string;

    @ApiProperty()
    @IsString()
    "nickname": string;

    @ApiProperty()
    @IsEmail()
    "email": string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    "phone"?: string;

    @ApiProperty({
        minLength: 8,
    })
    @MinLength(8)
    "password": string;
}