import { Injectable, OnModuleInit } from '@nestjs/common';
import { adminConfig } from 'src/core/config/admin.config';
import { IoredisService } from 'src/core/ioredis/ioredis.service';

class responseDataCyties {
  "data": [];
  "info": {
    "totalCount": number;
  }
}

@Injectable()
export class NovaposhtaService implements OnModuleInit {
  private readonly apiKey: string
  private cities: Promise<Response>[] = [];

  constructor(
    private readonly redis: IoredisService
  ){
    this.apiKey = adminConfig.novaPoshtaApiKey

  }

  async onModuleInit() {
    console.log('start')
        const responseCount = await this.customFetch({
            apiKey: this.apiKey,
            modelName: 'AddressGeneral',
            calledMethod: 'getCities',
            methodProperties: {
              Limit : "1"
            },
          });
        const res: responseDataCyties = await responseCount.json();
        const totalEl = res.info.totalCount;
        console.log({totalEl})
        const countPage = Math.ceil(totalEl/1000);
        const batchSize = 2;
        for (let i = 1; i <= countPage; i += batchSize) {
          const batch: Promise<Response>[] = [];

          for (
            let page = i;
            page < i + batchSize && page <= countPage;
            page++
          ) {
            batch.push(
              this.customFetch({
                apiKey: this.apiKey,
                modelName: 'AddressGeneral',
                calledMethod: 'getCities',
                methodProperties: {
                  Limit: 1000,
                  Page: String(page),
                },
              }),
            );
          }

          const responses = await Promise.all(batch);
          for (let a of responses){
            this.cities.push(...(await a.json()).data)
          }
          console.log(`processed pages ${i}-${i + batch.length - 1}`);
        }
  }

  async customFetch (dto: {}) {
    return await fetch('https://api.novaposhta.ua/v2.0/json/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto)
    })
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

  getCities(){
    return this.cities.pop();
  }
  // async getCities () {
  //   try {
  //     console.time('redis');
  //     const cacheCitiesStr = await this.redis.get('cities');
  //     console.timeEnd('redis');
  //     cacheCitiesStr && console.log(Buffer.byteLength(cacheCitiesStr, 'utf8') / 1024 / 1024, 'MB');
  //     console.time('parse');
  //     const cacheCities = cacheCitiesStr ? JSON.parse(cacheCitiesStr) : [];
  //     console.timeEnd('parse');
  //     if(cacheCities?.length){
  //       console.log('data cities from cache')
  //       return cacheCities;
  //     }
  //     const response = await this.customFetch({
  //         apiKey: this.apiKey,
  //         modelName: 'AddressGeneral',
  //         calledMethod: 'getCities',
  //         methodProperties: {
  //           Limit : "1"
  //         },
  //       });
  //     const res: responseDataCyties = await response.json();
  //     const totalEl = res.info.totalCount;
  //     console.log({totalEl})
  //     let accCities: Promise<Response>[] = [];
  //     const countPage = Math.ceil(totalEl/1000);
  //     const batchSize = 2;
  //     for (let i = 1; i <= countPage; i += batchSize) {
  //       const batch: Promise<Response>[] = [];

  //       for (
  //         let page = i;
  //         page < i + batchSize && page <= countPage;
  //         page++
  //       ) {
  //         batch.push(
  //           this.customFetch({
  //             apiKey: this.apiKey,
  //             modelName: 'AddressGeneral',
  //             calledMethod: 'getCities',
  //             methodProperties: {
  //               Limit: 1000,
  //               Page: String(page),
  //             },
  //           }),
  //         );
  //       }

  //       const responses = await Promise.all(batch);
  //       for (let a of responses){
  //         accCities.push(...(await a.json()).data)
  //       }
  //       console.log(`processed pages ${i}-${i + batch.length - 1}`);
  //     }
  //     await this.redis.set('cities', JSON.stringify(accCities))
  //     console.log('data cities from server')

  //     return accCities;
  //   } catch (error) {
  //     throw error;
  //   }
  // }
  findRegion() {
    return this.getAries();
  }

  findSity(dto: {}) {
    
    return this.getCities();
  }

}


