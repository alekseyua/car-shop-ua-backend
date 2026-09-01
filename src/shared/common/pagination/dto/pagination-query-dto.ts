import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({
    default: 1,
    example: 1,
    description: 'Номер страницы',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Количество элементов на странице',
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit?: number = 5;
}
