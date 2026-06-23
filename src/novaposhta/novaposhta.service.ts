import { Injectable } from '@nestjs/common';
import { adminConfig } from 'src/core/config/admin.config';

@Injectable()
export class NovaposhtaService {
  private readonly apiKey: string
  constructor(
  ){
    this.apiKey = adminConfig.novaPoshtaApiKey

  }

  async getAries() {
    try {
      
      console.log('start ')
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
    
    return data;
  } catch (error) {
      console.log(error)
  }
  }

  findAll() {
    return this.getAries();
  }

}


