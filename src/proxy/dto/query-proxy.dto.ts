import { IsString } from 'class-validator';

export class QueryPdfRequest {
  @IsString()
  'pdf': string;
}
