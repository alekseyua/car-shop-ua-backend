import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, timingSafeEqual } from 'node:crypto';

@Injectable()
export class LiqPayService {
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly checkoutUrl: string;

  constructor(config: ConfigService) {
    this.publicKey = config.getOrThrow<string>('LIQPAY_PUBLIC_KEY');

    this.privateKey = config.getOrThrow<string>('LIQPAY_PRIVATE_KEY');
    this.checkoutUrl = config.getOrThrow<string>('LIQPAY_CHECKOUT_URL');
    if (this.checkoutUrl !== 'https://www.liqpay.ua/api/3/checkout') {
      throw new Error('Invalid LiqPay checkout URL');
    }
  }

  createSignature(data: string): string {
    return createHash('sha3-256')
      .update(this.privateKey + data + this.privateKey, 'utf8')
      .digest('base64');
  }

  verifySignature(data: string, signature: string): boolean {
    if (!data || !signature || !/^[A-Za-z0-9+/]+={0,2}$/.test(signature)) {
      return false;
    }

    const expected = Buffer.from(this.createSignature(data), 'base64');
    const received = Buffer.from(signature, 'base64');

    if (
      received.length !== expected.length ||
      received.toString('base64') !== signature
    ) {
      return false;
    }

    return timingSafeEqual(expected, received);
  }

  createCheckout(params: {
    orderId: string; // providerOrderId
    amount: string; // например "125.50" UAH
    currency: string;
    description: string;
    resultUrl: string;
    serverUrl: string;
  }) {
    const amount = Number(params.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Invalid payment amount');
    }

    if (params.currency !== 'UAH') {
      throw new BadRequestException('Unsupported currency');
    }
    const payload = {
      public_key: this.publicKey,
      version: 7,
      action: 'pay',
      amount: amount.toFixed(2),
      currency: params.currency,
      description: params.description,
      order_id: params.orderId,
      language: 'uk',
      result_url: params.resultUrl,
      server_url: params.serverUrl,

      sandbox: 1,
    };
console.log('LiqPay checkout params:', {
  publicKeyPrefix: this.publicKey.slice(0, 8),
  checkoutUrl: this.checkoutUrl,
  payload,
});
    const json = JSON.stringify(payload);
    const data = Buffer.from(json, 'utf8').toString('base64');
    const signature = this.createSignature(data);

    return {
      action: this.checkoutUrl,
      data,
      signature,
    };
  }

  decodeCallback(data: string): Record<string, unknown> {
    try {
      // Принимаем только канонический Base64.
      const decodedBuffer = Buffer.from(data, 'base64');

      if (decodedBuffer.toString('base64') !== data) {
        throw new Error('Invalid Base64');
      }

      const payload: unknown = JSON.parse(decodedBuffer.toString('utf8'));

      if (
        typeof payload !== 'object' ||
        payload === null ||
        Array.isArray(payload)
      ) {
        throw new Error('Invalid payload');
      }

      return payload as Record<string, unknown>;
    } catch {
      throw new BadRequestException('Invalid LiqPay callback payload');
    }
  }

  isPublicKeyValid(value: unknown): boolean {
    return value === this.publicKey;
  }
}
