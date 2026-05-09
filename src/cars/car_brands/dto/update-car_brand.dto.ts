import { PartialType } from '@nestjs/mapped-types';
import { CreateCarBrandDto } from './create-car_brand.dto';

export class UpdateCarBrandDto extends PartialType(CreateCarBrandDto) {}
