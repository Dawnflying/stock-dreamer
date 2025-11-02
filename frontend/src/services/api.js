import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

/**
 * 股票API服务
 */
export const stockAPI = {
  /**
   * 获取股票信息
   * @param {string} symbol - 股票代码
   */
  getStockInfo: (symbol) => {
    return api.get(`/stock/${symbol}`);
  },

  /**
   * 获取股票历史数据
   * @param {string} symbol - 股票代码
   * @param {string} period - 时间周期
   * @param {string} interval - 数据间隔
   */
  getStockHistory: (symbol, period = '1mo', interval = '1d') => {
    return api.get(`/stock/${symbol}/history`, {
      params: { period, interval },
    });
  },

  /**
   * 获取股票日内数据
   * @param {string} symbol - 股票代码
   */
  getStockIntraday: (symbol) => {
    return api.get(`/stock/${symbol}/intraday`);
  },

  /**
   * 获取实时报价
   * @param {string} symbol - 股票代码
   */
  getRealTimeQuote: (symbol) => {
    return api.get(`/stock/${symbol}/quote`);
  },

  /**
   * 获取股票技术分析
   * @param {string} symbol - 股票代码
   * @param {string} period - 时间周期
   */
  getStockAnalysis: (symbol, period = '6mo') => {
    return api.get(`/stock/${symbol}/analysis`, {
      params: { period },
    });
  },

  /**
   * 获取多个股票信息
   * @param {string[]} symbols - 股票代码列表
   */
  getMultipleStocks: (symbols) => {
    return api.post('/stocks/multiple', { symbols });
  },

  /**
   * 搜索股票
   * @param {string} query - 搜索关键词
   */
  searchStocks: (query) => {
    return api.get('/stocks/search', {
      params: { q: query },
    });
  },

  /**
   * 比较股票
   * @param {string[]} symbols - 股票代码列表
   * @param {string} period - 时间周期
   */
  compareStocks: (symbols, period = '1mo') => {
    return api.post('/compare', { symbols, period });
  },

  /**
   * 健康检查
   */
  healthCheck: () => {
    return api.get('/health');
  },
};

export default api;
