import { IsInt, IsString, Min } from 'class-validator';

export class AddToCartDto {
  @IsString()
  'itemNo': string;

  @IsInt()
  @Min(1)
  'quantity': number;

  @IsString()
  'statusDelivery': string;
}
