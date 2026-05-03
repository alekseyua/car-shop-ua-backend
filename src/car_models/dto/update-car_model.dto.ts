import { PartialType } from '@nestjs/mapped-types';
import { CreateCarModelDto } from './create-car_model.dto';

export class UpdateCarModelDto extends PartialType(CreateCarModelDto) {}
