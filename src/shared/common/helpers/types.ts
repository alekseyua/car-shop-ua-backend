export type DeliveryStatus =
  | 'today'
  | 'tomorrow'
  | 'in 2 days'
  | 'in 3 days'
  | 'in 4 days'
  | 'in 5 days'
  | 'in 6 days'
  | 'in 7 days'
  | 'more than 7 days'
  | 'notAvailable'
  | 'reserved';

export interface ResponseStockDto {
  isStock: boolean;
  quantity: number;
  statusDelivery: DeliveryStatus;
}

export interface Stock {
  L: string;
  C: string;
  Q: string;
  R: number;
}

export type ParsedStock = {
  Stock: Stock[];
};


export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}