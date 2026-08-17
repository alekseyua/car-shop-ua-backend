import { adminConfig } from 'src/core/config/admin.config';
import { ParsedStock, ResponseStockDto, Stock } from './types';
import { randomUUID } from 'crypto';

export const delay = (ms = 1000): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const normoliseString = (str: string): string =>
  //eslint-disable-next-line
  str.replace(/[\s\-]/g, '').toUpperCase();

const funcParsed = (data: string): ParsedStock => {
  const parsed: unknown = JSON.parse(data);
  if (typeof parsed === 'object' && parsed !== null && 'Stock' in parsed) {
    return parsed as ParsedStock;
  }
  throw new Error('Parsed failed');
};

export const normolizeItemNoForSearch = (itemNo: string) => itemNo.replace(/\.|\-| /g, '');

export const normalizeStock = (
  stock: string | ParsedStock,
  currentCity: string,
): ResponseStockDto[] => {
  const parser: ParsedStock = typeof stock === 'object'? stock : funcParsed(stock);

  let todayQty = 0;
  let tomorrowQty = 0;

  for (const item of parser.Stock) {
    const quantity = Number(item.Q.replace(/[^\d]/g, ''));

    if (quantity <= 0) continue;

    if (item.L === currentCity) {
      todayQty += quantity;
    } else {
      tomorrowQty += quantity;
    }
  }

  const result: ResponseStockDto[] = [];

  if (todayQty > 0) {
    result.push({
      isStock: true,
      quantity: todayQty,
      statusDelivery: 'today',
    });
  }

  if (tomorrowQty > 0) {
    result.push({
      isStock: false,
      quantity: tomorrowQty,
      statusDelivery: 'tomorrow',
    });
  }

  if (result.length === 0) {
    result.push({
      isStock: false,
      quantity: 0,
      statusDelivery: 'notAvailable',
    });
  }
  return result;
};

export const normalizeDoubleNumber = (num) => {
  const rawPrice = String(num ?? '');
  const price = Number(rawPrice.replace(',', '.'));

  const normalizedPrice = Number.isNaN(price) ? 0 : price;
  return normalizedPrice;
}

export const markupPercentPrice = (price: number): number =>
  price + (price * Math.round(adminConfig.markupPercent)) / 100;


export const generateOrderNumber = () => {
  return `ORD-${Date.now()}-${randomUUID().slice(0, 8)}`;
};

export function generateNickname(): string {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  const nickname = `user_${suffix}`;
  return nickname;
}

export const normalizeImagePath = (img: string | []) =>
  typeof img === 'object'
    ? img.map((i: string) => i.replace('tcd/', 'tcd-pic/'))
    : img.replace('tcd/', 'tcd-pic/');

export const weakCache = () => {
  const cache = new WeakMap();
  return {
    set: (obj, value) => cache.set(obj, value),
    get: (obj) => cache.get(obj),
  };
};
