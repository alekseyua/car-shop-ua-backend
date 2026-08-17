import { ApiProperty } from '@nestjs/swagger';

export class ResponseCatalogCarDto {
  @ApiProperty({
    example: 3333,
    description: 'ID типа',
  })
  'modificationId': number;

  @ApiProperty({
    example: 2046,
    description: 'ID группы',
  })
  'groupId': number;

  @ApiProperty({
    example: 'Амортизація',
    description: 'Код группы',
  })
  'groupCode': string;

  @ApiProperty({
    example: 'Амортизатори',
    description: 'Код подгруппы',
  })
  'subGroupCode': string;

  @ApiProperty({
    example: 8,
    description: 'Количество товаров',
  })
  'count': number;
  @ApiProperty({
    example: '2026-05-10 16:34:24.964',
    description: 'Дата создания',
  })
  'createdAt': Date;
  @ApiProperty({
    example: '2026-05-10 16:34:24.964',
    description: 'Дата последнего обновления',
  })
  'updatedAt': Date;
}
