import { ApiProperty } from '@nestjs/swagger';
import {
  GarageCarFromPrisma,
  GarageCarResponseDto,
} from 'src/garage-car/dto/response-garage-car';

export class GarageResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty({ type: String, nullable: true })
  comment?: string | null;

  @ApiProperty({ type: Array, items: { type: 'string' } })
  cars!: GarageCarResponseDto[];

  @ApiProperty()
  isDefault!: boolean;
  // @ApiProperty({type: Array})
  // garageCars!: GarageCarResponseDto[]
}

export class GarageFromPrisma {
  id!: number;
  name!: string;
  comment?: string | null;
  isDefault!: boolean;
  cars!: GarageCarFromPrisma[];
}
