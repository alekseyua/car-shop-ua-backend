import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateGarageDto {
    @ApiProperty({
        name: 'name',
        example: 'new name'
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
        name: 'comment',
        example: 'new comment'
    })
    @IsOptional()
    @IsString()
    comment?: string;
}