import { adminConfig } from 'src/core/config/admin.config';
import { ParsedStock, ResponseStockDto, Stock } from './types';
import { randomUUID } from 'crypto';
import * as ExcelJs from 'exceljs';
import { productCachePriceDto } from 'src/core/ioredis/ioredis.types';
import { IoredisService } from 'src/core/ioredis/ioredis.service';
import {
  NormalizeProductItem,
  ProductItem,
} from 'src/catalog/products/dto/response-products.dto';
import {
  ModificationFromDb,
  NormalizeCarModification,
} from 'src/catalog/modification/dto/response-car_modification.dto';
import { GarageFromPrisma } from 'src/garage/dto/response-garage.dto';

export const delay = (ms = 1000): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const normalizeString = (str: string): string =>
  //eslint-disable-next-line
  str.replace(/[\s\-]/g, '').toUpperCase();

const funcParsed = (data: string): ParsedStock => {
  const parsed: unknown = JSON.parse(data);
  if (typeof parsed === 'object' && parsed !== null && 'Stock' in parsed) {
    return parsed as ParsedStock;
  }
  throw new Error('Parsed failed');
};

export const normalizeItemNoForSearch = (itemNo: string): string => {
  return itemNo.replace(/[.\s-]/g, '');
};

export const getProductFromPrice = async (
  itemNo: string,
  redis: IoredisService,
): Promise<productCachePriceDto | null> => {
  const data = await redis.hgetall('price:' + itemNo);
  if (!data || Object.keys(data).length === 0) {
    console.log(
      'getProductFromPrice failde to find product from price cache - ' + itemNo,
    );
    return null;
  }
  const stock = JSON.parse(data.stock) as Stock;
  return {
    itemNo: data.itemNo,
    name: data.name,
    price: normalizeDoubleNumber(data.price),
    catItemNo: data.catItemNo,
    stock,
  };
};

export const normalizeStock = (
  stock: string | ParsedStock,
  currentCity: string,
): ResponseStockDto[] => {
  const parser: ParsedStock =
    typeof stock === 'object' ? stock : funcParsed(stock);

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

export const normalizeDoubleNumber = (num: string | number): number => {
  const rawPrice = String(num ?? '');
  const price = Number(rawPrice.replace(',', '.'));

  const normalizedPrice = Number.isNaN(price) ? 0 : price;
  return normalizedPrice;
};

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

export const normalizeImagePath = (img: string | []): string | string[] =>
  typeof img === 'object'
    ? img.map((i: string) => i.replace('tcd/', 'tcd-pic/'))
    : img.replace('tcd/', 'tcd-pic/');

export const weakCache = <K extends object, V>() => {
  const cache = new WeakMap<K, V>();
  return {
    set: (obj: K, value: V) => cache.set(obj, value),
    get: (obj: K) => cache.get(obj),
  };
};

export const cellToString = (value: ExcelJs.CellValue | undefined): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString();
  }

  return '';
};

export const normalizeResponseProductItem = (
  item: ProductItem,
  cachePrice: productCachePriceDto | null,
): NormalizeProductItem => {
  const price = cachePrice
    ? markupPercentPrice(normalizeDoubleNumber(cachePrice.price))
    : markupPercentPrice(item.price);
  const stock: ResponseStockDto[] = cachePrice
    ? normalizeStock(cachePrice.stock, adminConfig.autotechsnicsCity)
    : normalizeStock(item.stock, adminConfig.autotechsnicsCity);
  return {
    itemNo: item.itemNo,
    brand: item.brand,
    description: item.description,
    searchDescription: item.searchDescription,
    inStock: item.inStock,
    firstPic: normalizeImagePath(item.firstPic) as string,
    retail: item.retail,
    salesOrderMultiple: item.salesOrderMultiple,
    criterias: item.criterias,
    price,
    stock,
  };
};

export const normalizeReplaces = (
  replaces: ProductItem[],
  cachePrice: productCachePriceDto | null,
): NormalizeProductItem[] =>
  replaces?.length === 0
    ? []
    : replaces
        ?.filter((item: ProductItem) => item.inStock)
        ?.map((item: ProductItem): NormalizeProductItem => {
          if (!cachePrice) {
            console.log('itemNo - ', item.itemNo, '---', item.stock);
          }
          return normalizeResponseProductItem(item, cachePrice);
        });

export const normalizeModification = (
  modification: ModificationFromDb,
): NormalizeCarModification => ({
  id: modification.id,
  kw: modification?.kw ? normalizeDoubleNumber(modification?.kw) : 0,
  hp: modification?.hp ? normalizeDoubleNumber(modification?.hp) : 0,
  modificationAutotechId: modification.modificationAutotechId,
  image: modification.image ?? '',
  name: modification.typeName ?? '',
  range: modification.typeRange ?? '',
  modelId: modification.modelId,
  model: modification.model.model,
  brand: modification.model.brand.mark,
  engineType: modification.engineType?.name ?? '',
  bodyType: modification.bodyType.name ?? '',
});

export const normalizeGarageModification = (
  modification: GarageFromPrisma['cars'][number]['modification'],
): NormalizeCarModification => ({
  id: modification.id,

  kw: modification.kw ? normalizeDoubleNumber(modification.kw) : 0,

  hp: modification.hp ? normalizeDoubleNumber(modification.hp) : 0,

  modificationAutotechId: modification.modificationAutotechId,

  image: modification.image ?? '',

  name: modification.typeName ?? '',

  range: modification.typeRange ?? '',

  modelId: modification.modelId,

  model: modification.model.model,

  brand: modification.model.brand.mark,

  engineType: modification.engineType?.name ?? '',

  bodyType: modification.bodyType?.name ?? '',
});
