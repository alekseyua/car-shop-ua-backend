import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResponseCarBrandDto {
  @ApiProperty({
    example: 1,
    description: 'ID бренда',
  })
  "id": number;

  @ApiProperty({
    example: 'BMW',
    description: 'Название бренда',
  })
  "mark": string;

  @ApiProperty({
    example: 101,
    description: 'ID бренда в Autotech',
  })
  "markAutotechId": number;

  @ApiProperty({
    example: true,
    description: 'Активен ли бренд',
  })
  "active": boolean;

  @ApiPropertyOptional({
    example: 'https://example.com/bmw.png',
    description: 'Изображение бренда',
    nullable: true,
  })
  "image": string | null;
}