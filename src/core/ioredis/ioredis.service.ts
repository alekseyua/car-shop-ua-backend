import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class IoredisService {
    private readonly redis: Redis
    constructor(
        private readonly config: ConfigService
    ){
        this.redis = new Redis({
            host: this.config.get('REDIS_HOST'),
            port: this.config.get('REDIS_PORT'),
            password: this.config.get('REDIS_USER_PASSWORD'),
            username: this.config.get('REDIS_USER'),
        })
    }

    async set(key: string, value:string){
        await this.redis.set(key, value);
    }

    async get(key: string) {
        return await this.redis.get(key);
    }

    async remove(key: string) {
        await  this.redis.del(key)
    }

    async removeAll(){
        await this.redis.flushdb()
    }
    // 1- Brand	
    // 2- ItemNo
    // 3- Name
    // 4- SalesOrderMultiple
    // 5- Price
    // 6- Barcode
    // 7- CatBrandNo
    // 8- CatBrand
    // 9- CatItemNo
    // 10- КрРіг
    // 11- Київ1
    // 12- ЧК
    // 13- КРОП
    // 14- ЦЕНТР
    async savePriceRedisPipeline (data: any){
        const batchSize = 1000;
        const city_1 = data[0][10];
        const city_2 = data[0][11];
        const city_3 = data[0][12];
        const city_4 = data[0][13];
        const city_5 = data[0][14];
        for(let i = 1; i < data.length; i+=batchSize){
            const pipeline = this.redis.pipeline();
            for( const row of data.slice(i, i+ batchSize)){
                const stock = {
                    Stock: [
                        { L: city_1, C: city_1, Q: row[10], R: 0 },
                        { L: city_2, C: city_2, Q: row[11], R: 0 },
                        { L: city_3, C: city_3, Q: row[12], R: 0 },
                        { L: city_4, C: city_4, Q: row[13], R: 0 },
                        { L: city_5, C: city_5, Q: row[14], R: 0 },
                    ]
                }
                const product = row.slice(1, 10);
                product.push(stock);
                pipeline.set(row[2], JSON.stringify(product));
            }
            await pipeline.exec();
        }
        console.log('save complate');
    }

}
