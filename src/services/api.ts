import axios from 'axios';
import type { Stock, KlineData, TechnicalIndicators, MarketOverview } from '@/types';

const API_BASE = 'http://localhost:3001/api';

export const api = {
  // 获取股票列表
  getStocks: async (params?: { keyword?: string; sort?: string }) => {
    const response = await axios.get<{ code: number; data: Stock[] }>(
      `${API_BASE}/stocks`,
      { params }
    );
    return response.data.data;
  },

  // 获取单只股票详情
  getStock: async (code: string) => {
    const response = await axios.get<{ code: number; data: Stock }>(
      `${API_BASE}/stocks/${code}`
    );
    return response.data.data;
  },

  // 获取K线数据
  getKlineData: async (code: string, params?: { period?: string; count?: number }) => {
    const response = await axios.get<{
      code: number;
      data: { kline: KlineData[]; indicators: TechnicalIndicators };
    }>(`${API_BASE}/kline/${code}`, { params });
    return response.data.data;
  },

  // 获取市场概况
  getMarketOverview: async () => {
    const response = await axios.get<{ code: number; data: MarketOverview }>(
      `${API_BASE}/market/overview`
    );
    return response.data.data;
  },
};

// WebSocket连接
export class StockWebSocket {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.ws = new WebSocket('ws://localhost:3001');

    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const listeners = this.listeners.get(message.type);
        if (listeners) {
          listeners.forEach(callback => callback(message.data));
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected, reconnecting...');
      this.reconnectTimer = setTimeout(() => this.connect(), 3000);
    };
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const stockWs = new StockWebSocket();
