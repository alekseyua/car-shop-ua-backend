import { ApiProperty } from '@nestjs/swagger';
import { GarageCarResponseDto } from 'src/garage-car/dto/response-garage-car';

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
}

export type GarageFromPrisma = {
  id: number;
  name: string;
  comment: string | null;
  isDefault: boolean;

  cars: {
    id: number;
    vin: string | null;
    nickname: string | null;

    modification: {
      id: number;
      modificationAutotechId: number;
      typeName: string | null;
      typeRange: string | null;
      kw: string | null;
      hp: string | null;
      image: string | null;
      modelId: number;

      model: {
        model: string;
        brand: {
          mark: string;
        };
      };

      engineType: {
        name: string;
      };

      bodyType: {
        name: string;
      };
    };
  }[];
};
