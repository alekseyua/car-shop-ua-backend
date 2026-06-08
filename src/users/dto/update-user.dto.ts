import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsDateString()
    birthDate?: string;

    @IsOptional()
    @IsString()
    nickname?: string;

    @IsOptional()
    @IsString()
    avatarUrl?: string;

    @IsOptional()
    @IsString()
    phone?: string;
}