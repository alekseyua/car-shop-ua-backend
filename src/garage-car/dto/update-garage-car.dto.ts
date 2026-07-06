import { PartialType } from '@nestjs/swagger';
import { CreateGarageCarDto } from './create-garage-car.dto';

export class UpdateGarageCarDto extends PartialType(CreateGarageCarDto) {}
