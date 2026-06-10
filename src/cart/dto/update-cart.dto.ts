import { PartialType } from '@nestjs/swagger';
import { CreateCartDto } from './create-cart.dto';
import { IsNumber } from 'class-validator';

export class UpdateCartDto extends PartialType(CreateCartDto) { }

export class UpdateCartQuantityDto {
    @IsNumber()
    "quantity": number;
}