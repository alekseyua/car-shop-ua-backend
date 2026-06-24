import { Injectable } from '@nestjs/common';
import { adminConfig } from 'src/core/config/admin.config';
import { IoredisService } from 'src/core/ioredis/ioredis.service';

@Injectable()
export class NovaposhtaService {
  private readonly apiKey: string
  constructor(
    private readonly redis: IoredisService
  ){
    this.apiKey = adminConfig.novaPoshtaApiKey

  }

  async getAries() {
    try {
      let cachAreaJson = null;
      const cacheArea = await this.redis.get('area');
      if(cacheArea && cacheArea.length){
        cachAreaJson = JSON.parse(cacheArea);
      }
      if(cachAreaJson){
        console.log('area from cache')
        return cacheArea;
      }
      const response = await fetch('https://api.novaposhta.ua/v2.0/json/', {
        method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: this.apiKey,
        modelName: 'Address',
        calledMethod: 'getAreas',
        methodProperties: {},
      }),
    });
    const data = await response.json();
    if(data.success){
      await this.redis.set('area', JSON.stringify(data.data))
    }
    console.log('area from server')
    return data.data;
  } catch (error) {
      console.log(error)
  }
  }

  findAll() {
    return this.getAries();
  }

  findSity(dto: {}) {
    
    return 
  }

}


