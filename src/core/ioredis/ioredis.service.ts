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

}
