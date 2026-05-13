import { Module } from '@nestjs/common';
import { CarModelsModule } from './cars/car_models/car_models.module';
import { CarBrandsModule } from './cars/car_brands/car_brands.module';
import { CoreModule } from './core/core.module';
import { CarModificationModule } from './cars/car_modification/car_modification.module';
import { ParserModule } from './parser/parser.module';
import { CatalogModule } from './cars/catalog/catalog.module';
import { ItemsCatalogModule } from './cars/items_catalog/items_catalog.module';

@Module({
  imports: [
    CoreModule,
    CarModelsModule,
    CarBrandsModule,
    CarModificationModule,
    ParserModule,
    CatalogModule,
    ItemsCatalogModule,
  ],
  controllers: [],
  providers: [],

})
export class AppModule { }
