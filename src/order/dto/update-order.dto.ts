import { PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { IsEnum } from 'class-validator';
import { OrderStatus } from 'generated/prisma/enums';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}


export class UpdateOrderStatusDto {
    @IsEnum(OrderStatus)
    status!: OrderStatus;
}