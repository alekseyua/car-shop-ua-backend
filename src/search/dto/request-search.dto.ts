import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { PaginationDto } from 'src/shared/common/pagination/dto/pagination-query-dto';

export class RequestSearchDto extends PaginationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  'q': string;
}
