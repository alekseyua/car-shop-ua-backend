import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResponseCarModelDto {
  @ApiProperty({
    example: 1,
    description: 'ID модели',
  })
  "id": number;

  @ApiProperty({
    example: 'X5',
    description: 'Название модели',
  })
  "model": string;

  @ApiProperty({
    example: 12345,
    description: 'ID модели в Autotech',
  })
  "modelAutotechId": number;

  @ApiProperty({
    example: '2016 - 2020',
    description: 'Период выпуска',
  })
  "range": string;

  @ApiProperty({
    example: true,
    description: 'Активна ли модель',
  })
  "active": boolean;

  @ApiPropertyOptional({
    example: 'https://example.com/x5.png',
    description: 'Изображение модели',
    nullable: true,
  })
  "image": string | null;

  @ApiProperty({
    example: 1,
    description: 'ID бренда',
  })
  "brandId": number;
}