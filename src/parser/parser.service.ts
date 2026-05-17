import {
    Injectable,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';

import {
    APIRequestContext,
    Browser,
    BrowserContext,
    chromium,
} from 'playwright';
import { ProductDetailResponse } from 'src/cars/items_catalog/dto/response-items_catalog.dto';

@Injectable()
export class ParserService implements OnModuleInit, OnModuleDestroy {
    private browser!: Browser;
    private context!: BrowserContext;
    private request!: APIRequestContext;

    private token: string | null = null;

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

        const response = await this.request.post(
            '/api/user/login',
            {
                data: {
                    comId: 15,
                    login: "48196",// process.env.AUTO_LOGIN,
                    pwd: 'CvF8TJwv',//rocess.env.AUTO_PASSWORD,
                },
            },
        );

        if (!response.ok()) {
            throw new Error(
                `Login failed: ${response.status()}`
            );
        }

        const data = await response.json();

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
            data?: any;
        },
    ) {
        // Собираем заголовки
        const headers = {
            ...this.getAuthHeaders(),
            ...options?.headers,
        };

        // Собираем body
        const body = options?.data;

        // Логируем на консоль перед отправкой
        console.log('--- REQUEST INFO ---');
        console.log('URL:', url);
        console.log('HEADERS:', headers);
        console.log('BODY:', body);
        console.log('-------------------');

        // Отправляем POST
        let response = await this.request.post(url, {
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

    async getCatalog(idAutotechnics: number) {
        const response = await this.authorizedPost(
            `/api/Car/Catalog/${idAutotechnics}`,
        );

        if (!response.ok()) {
            throw new Error(
                `Catalog error: ${response.status()}`
            );
        }

        return await response.json();
    }

    // -----------------------------------
    // GET ITEMS CATALOG
    // -----------------------------------

    async getItemsCatalog(
        typeId: number,
        groupId: number,
    ) {
        const response = await this.authorizedPost(
            `/api/Car/CatalogItems/?typeId=${typeId}&groupId=${groupId}`,
        );

        console.log('STATUS:', response.status());

        if (!response.ok()) {
            console.log(await response.text());

            throw new Error(
                `Items error: ${response.status()}`
            );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error(
                'Invalid catalog response format',
            );
        }

        return data;
    }

    // -----------------------------------
    // GET ITEM DETAILS
    // -----------------------------------
   
    async getItemDetails(itemNo: string): Promise<ProductDetailResponse> {
        const response = await this.authorizedPost(
            `/api/Items/ItemCard`,
            {
                data: JSON.stringify(itemNo),
                headers: {
                    'Content-Type': 'application/json',
                }
            },
        );
        if (!response.ok()) {
            throw new Error(
                `Item details error: ${response.status()}`
            );
        }

        return await response.json();
    }
}