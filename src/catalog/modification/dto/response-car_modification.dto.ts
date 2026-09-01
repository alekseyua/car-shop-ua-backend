import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from 'generated/prisma/client';
import { modificationInclude } from '../modification.service';

export class NormalizeCarModification {
  @ApiProperty()
  'id': number;

  @ApiProperty()
  'name': string;

  @ApiProperty()
  'range': string;

  @ApiProperty()
  'kw': number;

  @ApiProperty()
  'hp': number;

  @ApiProperty()
  'engineType': string;

  @ApiProperty()
  'bodyType': string;

  @ApiProperty()
  'modificationAutotechId': number;

  @ApiProperty()
  'image': string;

  @ApiProperty()
  'model': string;

  @ApiProperty()
  'brand': string;

  @ApiPropertyOptional({
    nullable: true,
  })
  'modelId'?: number | null;

  // @ApiProperty()
  // 'typeName': string;

  // @ApiProperty()
  // 'typeRange': string;
}

export type ModificationFromDb = Prisma.ModificationGetPayload<{
  include: typeof modificationInclude;
}>;

export class ModificationsResponseFromDb {
  'modifications': ModificationFromDb[];
}
