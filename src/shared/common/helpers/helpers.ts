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
  throw new Error('Parsed field');
};

export const normalizeStock = (
  stock: string,
  currentCity: string,
): ResponseStockDto[] => {
  const parser: ParsedStock = funcParsed(stock);
console.log(parser)
  return parser.Stock.reduce((acc: ResponseStockDto[], item: Stock) => {
    const quantity = Number(item.Q);

    if (item.L === currentCity && quantity > 0) {
      acc.push({
        isStock: true,
        quantity,
        statusDelivery: 'today',
      });

      return acc;
    }

    if (quantity > 0) {
      const tomorrowIndex = acc.findIndex(
        (v) => v.statusDelivery === 'tomorrow',
      );

      if (tomorrowIndex !== -1) {
        acc[tomorrowIndex].quantity += quantity;
      } else {
        acc.push({
          isStock: false,
          quantity,
          statusDelivery: 'tomorrow',
        });
      }

      return acc;
    }

    // if (item.R) {
    //   acc.push({
    //     isStock: false,
    //     quantity: item.R,
    //     statusDelivery: 'reserved',
    //   });

    //   return acc;
    // }

    acc.push({
      isStock: false,
      quantity: 0,
      statusDelivery: 'notAvailable',
    });

    return acc;
  }, []);
};

export const markupPercentPrice = (price: number): number =>
  price + (price * Math.round(adminConfig.markupPercent)) / 100;


export const generateOrderNumber = () => {
  return `ORD-${Date.now()}-${randomUUID().slice(0, 8)}`;
};