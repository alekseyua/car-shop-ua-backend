import { PartialType } from '@nestjs/swagger';
import { CreateGuestSessionDto } from './create-guest-session.dto';

export class UpdateGuestSessionDto extends PartialType(CreateGuestSessionDto) {}
