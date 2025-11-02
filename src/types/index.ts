export interface Stock {
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  marketCap: number;
  sector: string;
}

export interface KlineData {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

export interface TechnicalIndicators {
  ma5: (number | null)[];
  ma10: (number | null)[];
  ma20: (number | null)[];
  ma30: (number | null)[];
  macd: {
    dif: number[];
    dea: number[];
    macd: number[];
  };
  rsi: (number | null)[];
  kdj: {
    k: (number | null)[];
    d: (number | null)[];
    j: (number | null)[];
  };
}

export interface MarketOverview {
  total: number;
  rise: number;
  fall: number;
  flat: number;
  topGainers: Stock[];
  topLosers: Stock[];
  topVolume: Stock[];
}

export interface PriceUpdate {
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface StockNews {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishTime: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  tags: string[];
  url?: string;
}

export interface AIAnalysis {
  question: string;
  answer: string;
  confidence: number;
  relatedFactors: string[];
  timestamp: string;
}
