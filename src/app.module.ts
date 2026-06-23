import { Module } from '@nestjs/common';
import { CarModelsModule } from './catalog/models/models.module';
import { CarBrandsModule } from './catalog/brands/brands.module';
import { CoreModule } from './core/core.module';
import { CarModificationModule } from './catalog/modification/modification.module';
import { ParserModule } from './integrations/parser/parser.module';
import { CatalogModule } from './catalog/categories/categories.module';
import { ProductModule } from './catalog/products/products.module';
import { OemByItemModule } from './catalog/oem/oem.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AddressModule } from './users/address/address.module';
import { FavoriteModule } from './favorite/favorite.module';
import { OrderModule } from './order/order.module';
import { CartModule } from './cart/cart.module';
import { ReviewModule } from './review/review.module';
import { HistoryModule } from './history/history.module';
import { NovaposhtaModule } from './novaposhta/novaposhta.module';

@Module({
  imports: [
    CoreModule,
    CarModelsModule,
    CarBrandsModule,
    CarModificationModule,
    ParserModule,
    CatalogModule,
    ProductModule,
    OemByItemModule,
    UsersModule,
    AuthModule,
    AddressModule,
    FavoriteModule,
    OrderModule,
    CartModule,
    ReviewModule,
    HistoryModule,
    NovaposhtaModule,
  ],
  controllers: [],
  providers: [],

})
export class AppModule { }
