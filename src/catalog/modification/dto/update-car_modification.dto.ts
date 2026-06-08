import { PartialType } from '@nestjs/swagger';
import { CreateCarModificationDto } from './create-car_modification.dto';

export class UpdateCarModificationDto extends PartialType(CreateCarModificationDto) {}
