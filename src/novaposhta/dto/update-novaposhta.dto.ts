import { PartialType } from '@nestjs/swagger';
import { CreateNovaposhtaDto } from './create-novaposhta.dto';

export class UpdateNovaposhtaDto extends PartialType(CreateNovaposhtaDto) {}
