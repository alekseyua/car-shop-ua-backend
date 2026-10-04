import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCartDto } from './create-cart.dto';
import { IsInt, Min } from 'class-validator';

export class UpdateCartDto extends PartialType(CreateCartDto) {}

export class UpdateCartQuantityDto {
  @IsInt()
  @Min(1)
  @ApiProperty({
    example: '1',
  })
  'quantity': number;
}
