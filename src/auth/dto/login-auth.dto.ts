import { IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        example: "alekseyuadnepr@gmail.com"
    })

    @IsEmail()
    "email": string;

    @ApiProperty({
        example: "Qwert_12345"
    })
    @MinLength(8)
    "password": string;
}