import { Stock } from 'src/shared/common/helpers/types';

export type ProductRow = [
  string, // 0
  string, // Brand
  string, // ItemNo
  string, // Name
  string, // SalesOrderMultiple
  string, // Price
  string, // Barcode
  string, // CatBrandNo
  string, // CatBrand
  string, // CatItemNo
  string, // КрРіг
  string, // Київ1
  string, // ЧК
  string, // КРОП
  string, // ЦЕНТР
];

export interface productCachePriceDto {
  itemNo: string;
  name: string;
  price: number;
  catItemNo: string;
  stock: Stock;
}
