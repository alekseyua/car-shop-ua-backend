import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import {
  APIRequestContext,
  Browser,
  BrowserContext,
  chromium,
  Page,
} from 'playwright';
import * as cheerio from 'cheerio';

import { ResponseOemByItemDto } from 'src/catalog/oem/dto/response_oem_by_item.dto';
import {
  AccessoryCategoryDto,
  ProductAccessoriesDto,
} from 'src/accessories/dto/response.accessories.dto';
import { KroonProductRecommendationComponentDto, KroonProductRecommendationProductDto, KroonProductRecommendationResponseDto, KroonSmartSearchGroupDto, KroonSmartSearchItemDto, KroonSmartSearchResponseDto, LoginResponse } from './interfaces/response.parser.dto';
import { ResponseCatalogCarDto } from 'src/catalog/categories/dto/response-catalog.dto';
import {
  ResponseParserProductDto,
  ResponseProductDetailParserDto,
} from 'src/catalog/products/dto/response-products.dto';

@Injectable()
export class ParserService implements OnModuleInit, OnModuleDestroy {
  private browser!: Browser;
  private context!: BrowserContext;
  private request!: APIRequestContext;
  private kroonContext!: BrowserContext;

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
    // Kroon Oil context
    this.kroonContext = await this.browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/131.0.0.0 Safari/537.36',
      locale: 'ru-RU',
      extraHTTPHeaders: {
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
      },
    });
    console.log('ParserService initialized');
  }

  // -----------------------------------
  // DESTROY
  // -----------------------------------

  async onModuleDestroy() {
    await this.kroonContext?.close();
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
    console.log('URL:', url);
    console.log('METHOD: POST');
    console.log('BODY:', JSON.stringify(options?.data, null, 2));

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
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options?.headers,
        },
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
  i = 0;
  async getItemDetails(
    itemNo: string,
  ): Promise<ResponseProductDetailParserDto> {
    const response = await this.authorizedPost(`/api/Items/ItemCard`, {
      data: JSON.stringify(itemNo),
      headers: {
        'Content-Type': 'application/json',
        // Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'uk',
        // Connection: 'keep-alive',
        // Origin: 'https://autotechnics.ua',
        // Pragma: 'no-cache',
        // Referer: 'https://autotechnics.ua/',
        // 'Cache-Control': 'no-cache',
        // 'Sec-Fetch-Dest': 'empty',
        // 'Sec-Fetch-Mode': 'cors',
        // 'Sec-Fetch-Site': 'cross-site',
        // 'User-Agent':
        //   'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36',
        // 'sec-ch-ua':
        //   '"Chromium";v="152", "Not?A_Brand";v="24", "Google Chrome";v="152"',
        // 'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
      },
    });
    if (!response.ok()) {
      throw new Error(`Item details error: ${response.status()}`);
    }
    const data: unknown = await response.json();
    return data as ResponseProductDetailParserDto;
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

  // -----------------------------------
  // KROON OIL SMART SEARCH
  // -----------------------------------

  private parseKroonSmartSearch(html: string): KroonSmartSearchResponseDto {
    const $ = cheerio.load(html);

    const categories: KroonSmartSearchGroupDto[] = [];

    $('p.h3').each((_, categoryElement) => {
      const categoryTitle = $(categoryElement).text().trim();

      if (!categoryTitle) {
        return;
      }

      const items: KroonSmartSearchItemDto[] = [];

      // Ищем accordion'ы до следующей категории
      let current = $(categoryElement).next();

      while (current.length) {
        // Следующая категория
        if (current.is('p.h3')) {
          break;
        }

        current.find('a[href*="/product-recommendation/"]').each((_, link) => {
          const href = $(link).attr('href');

          if (!href) {
            return;
          }

          const title = $(link).find('.search-item-left h5').text().trim();

          const years = $(link).find('.search-item-right').text().trim();

          const id = this.extractKroonId(href);

          items.push({
            title,
            years,
            url: href,
            id,
          });
        });

        current = current.next();
      }

      if (items.length) {
        categories.push({
          title: categoryTitle,
          items,
        });
      }
    });

    return {
      categories,
    };
  }

  private extractKroonId(url: string): number {
    const parts = url.split('/').filter(Boolean);

    const last = parts.at(-1);

    const id = Number(last);

    return Number.isNaN(id) ? 0 : id;
  }
  private parseKroonProducts(
    $: cheerio.CheerioAPI,
  ): KroonProductRecommendationProductDto[] {
    const products: KroonProductRecommendationProductDto[] = [];

    $('.product-wrapper article.product').each((_, element) => {
      const product = $(element);

      const title = product
        .find('a.product-title')
        .first()
        .text()
        .replace(/\s+/g, ' ')
        .trim();

      if (!title) {
        return;
      }

      const url = product.find('a.product-title').first().attr('href') ?? '';

      if (!url) {
        return;
      }

      const kroonCode = product.attr('data-product-code') ?? undefined;

      // Ищем ссылку покупки по href,
      // а не по тексту и не по CSS-классу
      let buyUrl: string | undefined;

      product.find('a[href]').each((_, link) => {
        const href = $(link).attr('href');

        if (href && /\/b2b\/search\//i.test(href)) {
          buyUrl = href;
        }
      });

      let code: string | undefined;
      console.log({buyUrl})
      if (buyUrl) {
        const match = buyUrl.match(/\/b2b\/search\/([^/?#]+)/i);

        code = match?.[1];
      }

      products.push({
        title,
        url,
        id: this.extractKroonId(url),
        kroonCode,
        code,
      });
    });

    return products;
  }

  private parseKroonProductRecommendation(
    html: string,
    id: number,
  ): KroonProductRecommendationResponseDto {
    const $ = cheerio.load(html);

    // -----------------------------------
    // VEHICLE
    // -----------------------------------

    const rawTitle = $('h1').first().text().replace(/\s+/g, ' ').trim();

    const yearsMatch = rawTitle.match(/\((\d{4}\s*-\s*\d{4})\)/);

    const years = yearsMatch?.[1]?.trim() ?? '';

    const title = rawTitle.replace(/\s*\(\d{4}\s*-\s*\d{4}\)\s*$/, '').trim();

    // -----------------------------------
    // COMPONENTS
    // -----------------------------------

    const components: KroonProductRecommendationComponentDto[] = [];

    $('h3').each((_, element) => {
      const componentTitle = $(element).text().replace(/\s+/g, ' ').trim();

      if (!componentTitle) {
        return;
      }

      const component: KroonProductRecommendationComponentDto = {
        title: componentTitle,
        products: [],
      };

      // -----------------------------------
      // GO THROUGH SIBLINGS
      // -----------------------------------

      let current = $(element).next();

      while (current.length) {
        // Следующий компонент
        if (current.is('h3')) {
          break;
        }

        const text = current.text().replace(/\s+/g, ' ').trim();

        // -----------------------------------
        // VOLUME
        // -----------------------------------

        if (/Capacity:/i.test(text) || /Oбъем:/i.test(text)) {
          const capacityMatches = [
            ...text.matchAll(
              /(?:Capacity:|Oбъем:)\s*(.*?)(?=\s+(?:Capacity:|Oбъем:)|$)/gi,
            ),
          ]
            .map((match) => match[1]?.trim())
            .filter(Boolean);

          if (capacityMatches.length) {
            component.volume = capacityMatches.join(' / ');
          }
        }

        // -----------------------------------
        // REPLACEMENT
        // -----------------------------------

        const replacementMatch = text.match(
          /(?:Check|Change|Контроль|Замена).*?(?:months|month|km|мес\.|км)/i,
        );

        if (replacementMatch && !component.replacement) {
          component.replacement = replacementMatch[0].trim();
        }

        current = current.next();
      }

      // -----------------------------------
      // PRODUCTS
      //
      // ВАЖНО:
      // ищем product-wrapper не внутри current,
      // а среди ВСЕХ элементов между текущим h3
      // и следующим h3.
      // ---  --------------------------------

      const components: KroonProductRecommendationComponentDto[] = [];
      const allProducts = this.parseKroonProducts($);

      // console.log('[Kroon] Parsed products:', allProducts);


      // -----------------------------------
      // ADD COMPONENT
      // -----------------------------------

      if (
        component.products.length > 0 ||
        component.volume ||
        component.replacement
      ) {
        components.push(component);
        console.log('component.replacement text');
      }
      console.log({ 'component.replacement ': components });
    });

    return {
      id,
      title,
      years,
      components,
    };
  }

  async kroonSmartSearch(query: string): Promise<KroonSmartSearchResponseDto> {
    const page = await this.kroonContext.newPage();

    try {
      console.log('[Kroon] Open page');

      const pageResponse = await page.goto(
        'https://www.kroon-oil.com/ru/int/',
        {
          waitUntil: 'domcontentloaded',
        },
      );

      console.log('[Kroon] Page status:', pageResponse?.status());

      if (!pageResponse?.ok()) {
        throw new Error(`Kroon page error: ${pageResponse?.status()}`);
      }

      // Ждём, чтобы Cloudflare / cookies успели установиться
      await page.waitForTimeout(500);

      const csrfToken = await page.evaluate(() => {
        return (
          document.querySelector<HTMLInputElement>(
            'input[name="csrfmiddlewaretoken"]',
          )?.value ?? null
        );
      });

      console.log('[Kroon] CSRF:', csrfToken ? 'FOUND' : 'NOT FOUND');

      if (!csrfToken) {
        throw new Error('Kroon CSRF token not found');
      }

      const result = await page.evaluate(
        async ({ query, csrfToken }) => {
          const body = new URLSearchParams();

          body.append('query', query);
          body.append('csrfmiddlewaretoken', csrfToken);

          const response = await fetch('/ru/int/api/smart_search/', {
            method: 'POST',

            headers: {
              'X-Requested-With': 'XMLHttpRequest',
            },

            body,
          });

          return {
            status: response.status,
            contentType: response.headers.get('content-type'),
            text: await response.text(),
          };
        },
        {
          query,
          csrfToken,
        },
      );

      console.log('[Kroon] Search status:', result.status);

      console.log('[Kroon] Content-Type:', result.contentType);

      if (result.status !== 200) {
        throw new Error(`Kroon smart search error: ${result.status}`);
      }

      return this.parseKroonSmartSearch(result.text);
    } finally {
      await page.close();
    }
  }

  async kroonProductRecommendation(
    url: string,
  ): Promise<KroonProductRecommendationResponseDto> {
    const page = await this.kroonContext.newPage();

    const fullUrl = new URL(url, 'https://www.kroon-oil.com').toString();

    const id = this.extractKroonId(url);

    try {
      console.log('[Kroon] Open recommendation page:', fullUrl);

      console.log('[Kroon] Recommendation ID:', id);

      const response = await page.goto(fullUrl, {
        waitUntil: 'domcontentloaded',
      });

      console.log('[Kroon] Recommendation status:', response?.status());

      if (!response?.ok()) {
        throw new Error(
          `Kroon recommendation page error: ${response?.status()}`,
        );
      }

      // Ждём динамический контент
      await page.waitForTimeout(500);

      const html = await page.content();

      return this.parseKroonProductRecommendation(html, id);
    } finally {
      await page.close();
    }
  }
}
