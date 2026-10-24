import { IsUUID } from 'class-validator';

export class CreateCheckoutDto {
  @IsUUID()
  'orderId': number;

  'userId'?: number;
  'guestSessionId'?: string;
}
