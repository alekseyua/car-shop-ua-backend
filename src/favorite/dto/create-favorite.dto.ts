import { IsString } from 'class-validator';

export class CreateFavoriteDto {
    @IsString()
    "itemNo": string;
}