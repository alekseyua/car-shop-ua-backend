import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Browser, chromium, Page, request } from 'playwright';
import { ResponseParserItemsCatalogDto } from 'src/cars/items_catalog/dto/response-items_catalog.dto';
import { delay } from 'src/shared/common/pagination/helpers/helpers';

@Injectable()
export class ParserService implements OnModuleInit, OnModuleDestroy {
    constructor() { }
    private browser!: Browser;

    async onModuleInit() {
        this.browser = await chromium.launch({
            headless: true,
            slowMo: 50, // Замедляем выполнение на 50ms для лучшей отладки
        })
    }

    async onModuleDestroy() {
        await this.browser.close();
    }

    async getCatalog(idAutotechnics: number) {
        const url = 'https://ecom.ad.ua/api/Car/Catalog/' + idAutotechnics;
        const page = await this.browser.newPage();
        try {
            await page.goto('https://www.autotechnics.ua/b2b', { waitUntil: 'networkidle' })
            // проверяем если нужно активировать ввход то проходим авторизацию
            const headers = await this.authorize(page);
            const api = await request.newContext({
                baseURL: 'https://ecom.ad.ua',
                extraHTTPHeaders: {
                    'Content-Type': 'application/json',
                    // Добавьте другие необходимые заголовки, например, авторизационные токены
                },
            });
            const catalog = await (await api.post(url,{
                headers: headers
            })).json()
            return catalog;
        } catch (error) {
            console.log(error)
        } finally {
            console.log('finality')
            await page.close();
        }
    }

    async getItemsCatalog(typeId: number, idGroup: number): Promise<ResponseParserItemsCatalogDto[]> {
        const url = `https://ecom.ad.ua/api/Car/CatalogItems/?typeId=${typeId}&groupId=${idGroup}`;
        const page = await this.browser.newPage();
        try {
            await page.goto('https://www.autotechnics.ua/b2b', { waitUntil: 'networkidle' })
            // проверяем если нужно активировать ввход то проходим авторизацию
            const headers = await this.authorize(page);
            const api = await request.newContext({
                baseURL: 'https://ecom.ad.ua',
                extraHTTPHeaders: {
                    'Content-Type': 'application/json',
                    // Добавьте другие необходимые заголовки, например, авторизационные токены
                },
            });
            // console.log('Requesting items catalog with headers:',{url}, {headers});
            const response = await api.post(url, { headers });
            // console.log('Response:', await response.json());
            const catalogItems = await response.json();

            if (!Array.isArray(catalogItems)) {
                throw new Error('Invalid catalog response format');
            }

            return catalogItems;
        } catch (error) {
            console.log(error);
            throw error;
        } finally {
            console.log('finality')
            await page.close();
        }
    }
    private async authorize(page: Page) {
        console.log('start auth check');

        const modalWindow = page.locator(
            '.v-dialog__content.v-dialog__content--active',
        );

        const selfAccount = page.locator(
            '.v-menu__activator > button > .v-btn__content',
        );

        // уже авторизован
        if ((await selfAccount.count()) > 0) {
            console.log('already authorized');
            return;
        }

        // есть окно логина
        if ((await modalWindow.count()) > 0) {
            const form = modalWindow.locator('form');

            await form.locator('input[name="Login"]').fill('48196');

            await form.locator('input[name="Password"]').fill('CvF8TJwv');

            await page.waitForTimeout(1000);

            await form.locator('button[type="submit"]').click();

            // ждём завершения логина
            // await selfAccount.waitFor({
            //     timeout: 15000,
            // });
            const requestHeaders = page.waitForRequest(request =>
                request.method() === 'POST' &&
                request.url().includes('/Content/Home/')
            );
            console.log('authorization complete');
            return (await requestHeaders).headers();
        }
    }
}
