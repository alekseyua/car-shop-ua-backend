import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsNumber, IsString } from 'class-validator';

export class CartItemResponse {
  @ApiProperty({ example: 85 })
  @IsInt()
  'id': number;

  @ApiProperty({ example: 1 })
  @IsInt()
  'cartId': number;

  @ApiProperty({
    example: '2026-09-23T17:42:37.549Z',
    type: String,
    format: 'date-time',
  })
  @IsDate()
  'createdAt': Date;

  @ApiProperty({ example: 'FIM 7905185' })
  @IsString()
  'itemNo': string;

  @ApiProperty({ example: 'Акумуляторна батарея 70А' })
  @IsString()
  'title': string;

  @ApiProperty({ example: 12 })
  @IsInt()
  'quantity': number;

  @ApiProperty({ example: 5216.883 })
  @IsNumber()
  'price': number;

  @ApiProperty({
    example: 'tcd-com/15000/FIM7905185-1.jpg?46286173',
    nullable: true,
  })
  @IsString()
  'imageUrl': string | null;

  @ApiProperty({ example: 'today' })
  @IsString()
  'statusDelivery': string;
}

export class CartResponse {
  @ApiProperty({ example: 1 })
  'id': number;

  @ApiProperty({ type: () => [CartItemResponse] })
  'items': CartItemResponse[];

  @ApiProperty({ example: 625 })
  'total': number;
}
