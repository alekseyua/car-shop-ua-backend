import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import {
  APIRequestContext,
  Browser,
  BrowserContext,
  chromium,
} from 'playwright';
import {
  ResponseParserProductDto,
  ResponseProductDetailDto,
} from 'src/catalog/products/dto/response-products.dto';
import { ResponseOemByItemDto } from 'src/catalog/oem/dto/response_oem_by_item.dto';
import {
  AccessoryCategoryDto,
  ProductAccessoriesDto,
} from 'src/accessories/dto/response.accessories.dto';
import { LoginResponse } from './interfaces/response.parser.dto';
import { ResponseCatalogCarDto } from 'src/catalog/categories/dto/response-catalog.dto';

@Injectable()
export class ParserService implements OnModuleInit, OnModuleDestroy {
  private browser!: Browser;
  private context!: BrowserContext;
  private request!: APIRequestContext;

  private token: string | null = null;

  constructor() {}
  // -----------------------------------
  // INIT
  // -----------------------------------

  async onModuleInit() {
    this.browser = await chromium.launch({
      headless: true,
    });

    this.context = await this.browser.newContext({
      baseURL: 'https://ecom.ad.ua',
    });

    this.request = this.context.request;

    await this.login();

    console.log('ParserService initialized');
  }

  // -----------------------------------
  // DESTROY
  // -----------------------------------

  async onModuleDestroy() {
    await this.context?.close();
    await this.browser?.close();
  }

  // -----------------------------------
  // LOGIN
  // -----------------------------------

  private async login() {
    console.log('START LOGIN...');

    const response = await this.request.post('/api/user/login', {
      data: {
        comId: 15,
        login: '48196', // process.env.AUTO_LOGIN,
        pwd: 'CvF8TJwv', //rocess.env.AUTO_PASSWORD,
      },
    });

    if (!response.ok()) {
      throw new Error(`Login failed: ${response.status()}`);
    }

    const data = (await response.json()) as LoginResponse;

    if (!data?.token) {
      throw new Error('Token not found in login response');
    }

    this.token = data.token;

    console.log('LOGIN SUCCESS');
  }

  // -----------------------------------
  // AUTH HEADERS
  // -----------------------------------

  private getAuthHeaders() {
    if (!this.token) {
      throw new Error('Token is missing');
    }

    return {
      Authorization: `Bearer ${this.token}`,
    };
  }

  // -----------------------------------
  // REQUEST WRAPPER
  // -----------------------------------

  private async authorizedPost(
    url: string,
    options?: {
      headers?: Record<string, string>;
      data?: unknown;
      timeout?: number;
    },
  ) {
    // Собираем заголовки
    const headers = {
      ...this.getAuthHeaders(),
      ...options?.headers,
    };

    // Собираем body
    const body = options?.data;

    // Отправляем POST
    let response = await this.request.post(url, {
      ...options,
      headers,
      data: body,
    });

    // token expired
    if (response.status() === 401) {
      console.log('TOKEN EXPIRED → RELOGIN');

      await this.login();

      response = await this.request.post(url, {
        headers: this.getAuthHeaders(),
        data: options?.data,
      });
    }

    return response;
  }
  // -----------------------------------
  // RESET AUTH
  // -----------------------------------

  async resetAuth() {
    this.token = null;

    await this.login();

    console.log('AUTH RESET SUCCESS');
  }
  // -----------------------------------
  // GET CATALOG
  // -----------------------------------

  async getCatalog(idAutotechnics: number): Promise<ResponseCatalogCarDto[]> {
    const response = await this.authorizedPost(
      `/api/Car/Catalog/${idAutotechnics}`,
    );

    if (!response.ok()) {
      throw new Error(`Catalog error: ${response.status()}`);
    }
    const data: unknown = await response.json();
    return data as ResponseCatalogCarDto[];
  }

  // -----------------------------------
  // GET ITEMS CATALOG
  // -----------------------------------

  async getProduct(
    typeId: number,
    groupId: number,
  ): Promise<ResponseParserProductDto[]> {
    const response = await this.authorizedPost(
      `/api/Car/CatalogItems/?typeId=${typeId}&groupId=${groupId}`,
    );

    console.log('STATUS:', response.status());

    if (!response.ok()) {
      console.log(await response.text());

      throw new Error(`Items error: ${response.status()}`);
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Invalid catalog response format');
    }

    return data as ResponseParserProductDto[];
  }

  // -----------------------------------
  // GET ITEM DETAILS
  // -----------------------------------

  async getItemDetails(itemNo: string): Promise<ResponseProductDetailDto> {
    const response = await this.authorizedPost(`/api/Items/ItemCard`, {
      data: JSON.stringify(itemNo),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok()) {
      throw new Error(`Item details error: ${response.status()}`);
    }
    const data: unknown = await response.json();
    return data as ResponseProductDetailDto;
  }
  // -----------------------------------
  // GET LIST ITEM OEM
  // -----------------------------------

  async getListItemOem(itemNo: string): Promise<ResponseOemByItemDto[]> {
    const response = await this.authorizedPost('api/Catalog/ItemOE', {
      data: JSON.stringify(itemNo),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok()) {
      throw new Error(`Item OEM error: ${response.status()}`);
    }
    const data: unknown = await response.json();
    return data as ResponseOemByItemDto[];
  }

  // -----------------------------------
  // GET LIST TOP PRODUCTS
  // -----------------------------------
  async getTopProducts(): Promise<ResponseParserProductDto[]> {
    const response = await this.authorizedPost('api/Content/Home', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok()) {
      throw new Error(`Top products error: ${response.status()}`);
    }
    const data: unknown = await response.json();
    const { topOffers } = data as { topOffers: unknown };
    return topOffers as ResponseParserProductDto[];
  }
  // -----------------------------------
  // GET PRICE PRODUCTS
  // -----------------------------------
  async getPriceXLSProducts() {
    //https://ecom.ad.ua/api/itemSet/downloadPrice
    const response = await this.authorizedPost('api/itemSet/downloadPrice', {
      headers: {
        accept:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'content-type': 'application/json',
      },
      data: 'xlsx3',
      timeout: 0,
    });
    if (!response.ok()) {
      throw new Error(`Price XLS error: ${response.status()}`);
    }

    // Получаем Excel как Buffer
    const buffer = await response.body();

    return buffer;
  }
  // -----------------------------------
  // GET Menu ACCESSORIES
  // -----------------------------------
  async getMenuAccessories(): Promise<AccessoryCategoryDto[]> {
    const response = await this.authorizedPost('api/content/Catalog', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok()) {
      throw new Error(`Menu accessories error: ${response.status()}`);
    }
    const data: unknown = await response.json();
    return data as AccessoryCategoryDto[];
  }
  // -----------------------------------
  // GET Catalog ACCESSORIES
  // -----------------------------------
  async getCatalogAccessories(id: number): Promise<ProductAccessoriesDto[]> {
    const start = performance.now();

    try {
      const response = await this.authorizedPost('api/items/ByTreeId', {
        data: JSON.stringify(id),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const elapsed = performance.now() - start;

      console.log(
        `[getCatalogAccessories] id=${id}, status=${response.status()}, time=${elapsed.toFixed(2)} ms`,
      );

      if (!response.ok()) {
        throw new Error(`Catalog accessories error: ${response.status()}`);
      }

      const data: unknown = await response.json();

      return data as ProductAccessoriesDto[];
    } catch (error) {
      const elapsed = performance.now() - start;

      console.error(
        `[getCatalogAccessories] id=${id}, time=${elapsed.toFixed(2)} ms`,
        error,
      );

      throw error;
    }
  }
}
