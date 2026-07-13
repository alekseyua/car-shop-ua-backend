import { ApiProperty } from '@nestjs/swagger';
import { GarageCarResponseDto } from 'src/garage-car/dto/response-garage-car';

export class GarageResponseDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    name!: string;

    @ApiProperty({ type: String, nullable: true })
    comment?: string | null;

    // @ApiProperty({type: Array})
    // garageCars!: GarageCarResponseDto[]
}