export type CurrencyCode = 'USD' | 'CNY' | 'HKD';

export enum AssetCategory {
  Cash = 'Cash',
  Stock = 'Stock',
  Bond = 'Bond',
  Crypto = 'Crypto',
  RealEstate = 'Real Estate',
  Other = 'Other'
}

export interface User {
  id: string;
  username: string;
  avatar?: string;
  lastSync?: number;
}

export interface Holding {
  id: string;
  symbol: string;
  quantity: number;
  category: AssetCategory | string;
  currency: CurrencyCode;
  currentPrice: number;
  lastUpdated: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
  percent: number;
}

export interface HistoryPoint {
  timestamp: number;
  valueUSD: number;
  valueCNY: number;
}