import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { Browser, BrowserContext, chromium, Page } from 'playwright';
import * as cheerio from 'cheerio';

import {
  KroonProductRecommendationComponentDto,
  KroonProductRecommendationProductDto,
  KroonProductRecommendationResponseDto,
  KroonSmartSearchGroupDto,
  KroonSmartSearchItemDto,
  KroonSmartSearchResponseDto,
} from './interfaces/response.parser.dto';

@Injectable()
export class ParserServiceKroonOil implements OnModuleInit, OnModuleDestroy {
  private browser!: Browser;
  private kroonContext!: BrowserContext;

  constructor() {}
  // -----------------------------------
  // INIT
  // -----------------------------------

  async onModuleInit() {
    this.browser = await chromium.launch({
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
      headless: true,
      args: ['--no-sandbox'],
      // headless: false,
      // slowMo: 20200,
    });

    // Kroon Oil context
    this.kroonContext = await this.browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/154.0.0.0 Safari/537.36',
      // locale: 'ru-RU',
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
        ':authority': 'www.kroon-oil.com',
      },
    });
    console.log('ParserServiceKroonOil initialized');
  }

  // -----------------------------------
  // DESTROY
  // -----------------------------------

  async onModuleDestroy() {
    await this.kroonContext?.close();
  }

  // -----------------------------------
  // KROON OIL SMART SEARCH
  // -----------------------------------

  private async handleKroonCookies(page: Page): Promise<void> {
    const popup = page.locator('#cookie_popup_body');
    try {
      await popup.waitFor({
        state: 'attached',
        timeout: 1500,
      });

      await popup.evaluate((element) => {
        (element as HTMLElement).style.display = 'none';
      });
    } catch {
      // Попап отсутствует — продолжаем работу.
    }
    // const acceptButton = page.locator('#cookie_popup_acceptButton');

    // try {
    //   // Popup может отсутствовать, если согласие уже сохранено.
    //   console.log('start check open modal popap cookies');
    //   if (!(await popup.isVisible().catch(() => false))) {
    //     console.log('[Kroon] Cookie popup not visible');
    //     return;
    //   }
    //   console.log('start click');
    //   await acceptButton.click({
    //     timeout: 500,
    //   });
    //   console.log('[Kroon] Cookies accepted successfully');
    // } catch (error) {
    //   console.warn(
    //     '[Kroon] Cookie popup handling issue:',
    //     error instanceof Error ? error.message : error,
    //   );
    // }
  }

  private isCloudflareChallenge(html: string): boolean {
    const $ = cheerio.load(html);

    const title = $('title').text().trim().toLowerCase();
    const bodyText = $('body').text().toLowerCase();

    return (
      html.includes('cf-turnstile') ||
      html.includes('cf-chl-widget') ||
      html.includes('cf_chl_tk') ||
      html.includes('cf_chl_opt') ||
      title.includes('just a moment') ||
      bodyText.includes('выполнение проверки безопасности') ||
      bodyText.includes('verify you are human') ||
      bodyText.includes('checking your browser')
    );
  }

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
    element,
  ): KroonProductRecommendationProductDto[] {
    const products: KroonProductRecommendationProductDto[] = [];

    $(element)
      .find('.product-advise-slider')
      .first()
      .find('.product-wrapper article.product')
      .each((i, productElement) => {
        const product = $(productElement);

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

        let code: string | undefined;

        if (kroonCode) {
          code = 'KL' + kroonCode;
        }

        products.push({
          title,
          url,
          id: i,
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

    $('.accordion-item').each((_, element) => {
      const componentTitle = $(element)
        .find('.accordion-header > h3')
        .first()
        .text()
        .replace(/\s+/g, ' ')
        .trim();

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

      let current = $(element).find('.accordion-header > h3').first().next();

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
        // REPLACEMENT INTERVAL
        // -----------------------------------
        const interval = $(element).find('.interval-item').first().text();

        // const replacementMatch = interval.match(
        //   /(?:Check|Change|Контроль|Замена).*?(?:months|month|km|мес\.|км)/i,
        // );

        // if (replacementMatch && !component.replacement) {
        //   component.replacement = replacementMatch[0].trim();
        // }
        if (interval && !component.replacement) {
          component.replacement = interval.trim();
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

      const allProducts = this.parseKroonProducts(
        $,
        $(element).find('.accordion-collapse > .accordion-body').first(),
      );
      component.products.push(...allProducts);

      // -----------------------------------
      // ADD COMPONENT
      // -----------------------------------

      if (
        component.products.length > 0 ||
        component.volume ||
        component.replacement
      ) {
        components.push(component);
      }
    });
    return {
      id,
      title,
      years,
      components,
    };
  }
  // ParserService

  private kroonQueue: Promise<unknown> = Promise.resolve();
  private lastKroonRequestAt = 0;

  private readonly kroonMinIntervalMs = 5000;

  private async withKroonQueue<T>(task: () => Promise<T>): Promise<T> {
    const run = this.kroonQueue.then(async () => {
      try {
        return await task();
      } finally {
        await new Promise((resolve) =>
          setTimeout(resolve, this.kroonMinIntervalMs),
        );
      }
    });

    this.kroonQueue = run.then(
      () => undefined,
      () => undefined,
    );

    return run;
  }
  // private async kroonSmartSearchInternal(
  //   query: string,
  // ): Promise<KroonSmartSearchResponseDto> {
  //   const page = await this.kroonContext.newPage();

  //   try {
  //     console.log('[Kroon] Open page');

  //     const pageResponse = await page.goto(
  //       'https://www.kroon-oil.com/en/int/',
  //       {
  //         waitUntil: 'domcontentloaded',
  //       },
  //     );
  //     console.log('start hide cookies');
  //     await this.handleKroonCookies(page);
  //     console.log('end hide cookies');
  //     const html = await page.content();

  //     if (this.isCloudflareChallenge(html)) {
  //       throw new Error(
  //         'Kroon Cloudflare challenge detected on smart search page',
  //       );
  //     }
  //     const status = pageResponse?.status() ?? 0;
  //     console.log('[Kroon] Page status:', status);
  //     if (status === 403) {
  //       const headers = await pageResponse?.allHeaders();
  //       const body = await page
  //         .locator('body')
  //         .innerText()
  //         .catch(() => '');

  //       console.error('[Kroon] Initial page response', {
  //         status,
  //         url: pageResponse?.url(),
  //         contentType: headers?.['content-type'],
  //         server: headers?.server,
  //         cfRay: headers?.['cf-ray'],
  //         bodyPreview: body.slice(0, 500),
  //       });
  //     }
  //     if (!pageResponse?.ok()) {
  //       throw new Error(`Kroon page error: ${pageResponse?.status()}`);
  //     }

  //     // Ждём, чтобы Cloudflare / cookies успели установиться
  //     // await page.waitForTimeout(500);

  //     const csrfToken = await page.evaluate(() => {
  //       return (
  //         document.querySelector<HTMLInputElement>(
  //           'input[name="csrfmiddlewaretoken"]',
  //         )?.value ?? null
  //       );
  //     });

  //     console.log('[Kroon] CSRF:', csrfToken ? 'FOUND' : 'NOT FOUND');

  //     if (!csrfToken) {
  //       throw new Error('Kroon CSRF token not found');
  //     }

  //     const result = await page.evaluate(
  //       async ({ query, csrfToken }) => {
  //         const body = new URLSearchParams();

  //         body.append('query', query);
  //         body.append('csrfmiddlewaretoken', csrfToken);

  //         const response = await fetch('/en/int/api/smart_search/', {
  //           method: 'POST',

  //           headers: {
  //             'X-Requested-With': 'XMLHttpRequest',
  //           },

  //           body,
  //         });

  //         return {
  //           status: response.status,
  //           url: response.url,
  //           redirected: response.redirected,
  //           contentType: response.headers.get('content-type'),
  //           server: response.headers.get('server'),
  //           headers: Object.fromEntries(response.headers.entries()),
  //           text: await response.text(),
  //         };
  //       },
  //       {
  //         query,
  //         csrfToken,
  //       },
  //     );

  //     console.log('[Kroon] Response diagnostics', {
  //       status: result.status,
  //       url: (result as any).url,
  //       contentType: result.contentType,
  //       cfRay: (result as any).cfRay,
  //     });
  //     if (this.isCloudflareChallenge(result.text)) {
  //       console.error('[Kroon] Cloudflare challenge returned by smart_search', {
  //         status: result.status,
  //         contentType: result.contentType,
  //         query,
  //       });

  //       throw new Error('Kroon smart search blocked by Cloudflare');
  //     }

  //     if (result.status !== 200) {
  //       throw new Error(`Kroon smart search error: ${result.status}`);
  //     }

  //     // if (result.status !== 200) {
  //     //   console.warn('[Kroon] Smart search failed', {
  //     //     status: result.status,
  //     //     query,
  //     //     contentType: result.contentType,
  //     //     bodyPreview: result.text.slice(0, 3000),
  //     //   });
  //     //   throw new Error(`Kroon smart search error: ${result.status}`);
  //     // }

  //     return this.parseKroonSmartSearch(result.text);
  //   } finally {
  //     await page.close();
  //   }
  // }
  private async kroonSmartSearchInternal(
    query: string,
  ): Promise<KroonSmartSearchResponseDto> {
    const page = await this.kroonContext.newPage();

    try {
      console.log('[Kroon] Open page');

      const pageResponse = await page.goto(
        'https://www.kroon-oil.com/en/int/',
        { waitUntil: 'domcontentloaded' },
      );
      console.log('start hide popup');
      await this.handleKroonCookies(page);
      console.log('end hide popup');

      console.log('start cloudflare ');
      if (this.isCloudflareChallenge(await page.content())) {
        throw new Error('Kroon Cloudflare challenge detected');
      }
      console.log('end cloudflare');

      if (!pageResponse?.ok()) {
        throw new Error(`Kroon page error: ${pageResponse?.status()}`);
      }

      // Логируем запросы, которые выполняет сама форма.
      // const requests: Array<{
      //   method: string;
      //   url: string;
      //   postData: string | null;
      // }> = [];

      // page.on('request', (request) => {
      //   if (request.method() !== 'GET') {
      //     requests.push({
      //       method: request.method(),
      //       url: request.url(),
      //       postData: request.postData(),
      //     });

      //     console.log('[Kroon] Request', {
      //       method: request.method(),
      //       url: request.url(),
      //       postData: request.postData(),
      //     });
      //   }
      // });
      await page.waitForTimeout(1000);

      // Имитируем пользователя.
      const input = page.locator('#input-kenteken');
      await input.waitFor({ state: 'visible' });
      await input.fill(query);

      // Отправляем форму настоящим кликом.
      await page.locator('#licence_submit_button').click();

      // Ждём завершения возможного AJAX-запроса.
      // await page
      //   .waitForLoadState('networkidle', {
      //     timeout: 10_000,
      //   })
      //   .catch(() => {});

      // Даём странице обновить DOM после AJAX.
      await page.locator('.search-results-inner .search-item').first().waitFor({
        state: 'visible',
        timeout: 15_000,
      });

      const resultHtml = await page.content();
      // const bodyText = await page
      //   .locator('body')
      //   .innerText()
      //   .catch(() => '');

      // console.log('[Kroon] Form completed', {
      //   url: page.url(),
      //   title: await page.title(),
      //   requests,
      //   bodyPreview: bodyText.slice(0, 3000),
      // });

      if (this.isCloudflareChallenge(resultHtml)) {
        throw new Error('Kroon form blocked by Cloudflare');
      }

      // Здесь вызываем парсер фактического результата формы.
      return this.parseKroonSmartSearch(resultHtml);
    } finally {
      await page.close();
    }
  }
  private async kroonProductRecommendationInternal(
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
      // await page.waitForTimeout(500);
      await this.handleKroonCookies(page);
      const html = await page.content();

      if (this.isCloudflareChallenge(html)) {
        throw new Error(`Kroon Cloudflare challenge detected: ${fullUrl}`);
      }
      return this.parseKroonProductRecommendation(html, id);
    } finally {
      await page.close();
    }
  }

  async kroonSmartSearch(query: string): Promise<KroonSmartSearchResponseDto> {
    return this.withKroonQueue(() => this.kroonSmartSearchInternal(query));
  }
  async kroonProductRecommendation(
    url: string,
  ): Promise<KroonProductRecommendationResponseDto> {
    return this.withKroonQueue(() =>
      this.kroonProductRecommendationInternal(url),
    );
  }
}
