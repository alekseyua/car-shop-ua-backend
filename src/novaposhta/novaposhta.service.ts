import { Injectable, OnModuleInit } from '@nestjs/common';
import { adminConfig } from 'src/core/config/admin.config';
import { IoredisService } from 'src/core/ioredis/ioredis.service';
import { QueryCitiesDto } from './dto/query-novaposhta.dto';
import { CityResponseDto } from './dto/response-novaposhta.dto';

class responseDataCyties {
  "data": CityResponseDto[];
  "info": {
    "totalCount": number;
  }
}

@Injectable()
export class NovaposhtaService implements OnModuleInit {
  private readonly apiKey: string
  private cities: CityResponseDto[] = [];

  constructor(
    private readonly redis: IoredisService
  ){
    this.apiKey = adminConfig.novaPoshtaApiKey

  }

  async customFetch(dto: {}) {
    return await fetch('https://api.novaposhta.ua/v2.0/json/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto)
    })
  }

  async onModuleInit() {
    // временно останавливаем доделаем позже
    console.time('novapochta-cities')
        // const responseCount = await this.customFetch({
        //     apiKey: this.apiKey,
        //     modelName: 'AddressGeneral',
        //     calledMethod: 'getCities',
        //     methodProperties: {
        //       Limit : "1"
        //     },
        //   });
        // const res: responseDataCyties = await responseCount.json();
        // const totalEl = res.info.totalCount;
        // console.log({totalEl})
        // const countPage = Math.ceil(totalEl/1000);
        // const batchSize = 2;
        // for (let i = 1; i <= countPage; i += batchSize) {
        //   const batch: Promise<Response>[] = [];

        //   for (
        //     let page = i;
        //     page < i + batchSize && page <= countPage;
        //     page++
        //   ) {
        //     batch.push(
        //       this.customFetch({
        //         apiKey: this.apiKey,
        //         modelName: 'AddressGeneral',
        //         calledMethod: 'getCities',
        //         methodProperties: {
        //           Limit: 1000,
        //           Page: String(page),
        //         },
        //       }),
        //     );
        //   }

        //   const responses = await Promise.all(batch);
        //   for (let a of responses){
        //     this.cities.push(...(await a.json()).data)
        //   }
        //   console.log(`processed pages ${i}-${i + batch.length - 1}`);
        // }
    console.timeEnd('novapochta-cities')
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
      const response = await this.customFetch({
        apiKey: this.apiKey,
        modelName: 'Address',
        calledMethod: 'getAreas',
        methodProperties: {},
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
 
  findRegion() {
    return this.getAries();
  }

  findSity(dto: QueryCitiesDto) {
    const { city } = dto;
    if(city.length < 2) {
      return 'Query a city only for  min 2 letter'
    }
    return this.cities.filter((c: CityResponseDto) => c.Description.includes(city));
  }

}


