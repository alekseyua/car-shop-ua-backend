import { PartialType } from '@nestjs/swagger';
import { CreateItemsCatalogDto } from './create-items_catalog.dto';

export class UpdateItemsCatalogDto extends PartialType(CreateItemsCatalogDto) {}
