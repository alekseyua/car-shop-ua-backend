import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import paginationConfig from "./config/pagination.config";
import { PrismaModule } from "./prisma/prisma.module";

@Global()
@Module({
    imports:[ 
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            paginationConfig
          ]
        }),
        PrismaModule,
    ],
    providers: [],
    exports: []
})

export class CoreModule {};