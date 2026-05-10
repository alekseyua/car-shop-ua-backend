import { ApiProperty } from '@nestjs/swagger';

export class ResponseCatalogCarDto {
  @ApiProperty({
    example: 15,
    description: 'ID компании',
  })
  "comId": number;

  @ApiProperty({
    example: 3333,
    description: 'ID типа',
  })
  "typeId": number;

  @ApiProperty({
    example: 2046,
    description: 'ID группы',
  })
  "groupId": number;

  @ApiProperty({
    example: 'Амортизація',
    description: 'Код группы',
  })
  "groupCode": string;

  @ApiProperty({
    example: 'Амортизатори',
    description: 'Код подгруппы',
  })
  "subGroupCode": string;

  @ApiProperty({
    example: 8,
    description: 'Количество товаров',
  })
  "count": number;
}