import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { stocksData } from './data/stocks.js';
import { generateKlineData, generateRealtimePrice, calculateTechnicalIndicators } from './utils/mockData.js';
import { getStockNews } from './data/news.js';
import aiService from './services/aiService.js';
import searchService from './services/searchService.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 存储所有股票的K线数据
const klineDataCache = new Map();

// 初始化K线数据
stocksData.forEach(stock => {
  klineDataCache.set(stock.code, generateKlineData(stock.price, 200));
});

// 获取股票列表
app.get('/api/stocks', (req, res) => {
  const { keyword, sort } = req.query;

  let result = [...stocksData];

  // 搜索过滤
  if (keyword) {
    const kw = keyword.toLowerCase();
    result = result.filter(stock =>
      stock.code.toLowerCase().includes(kw) ||
      stock.name.toLowerCase().includes(kw)
    );
  }

  // 排序
  if (sort === 'change') {
    result.sort((a, b) => b.changePercent - a.changePercent);
  } else if (sort === '-change') {
    result.sort((a, b) => a.changePercent - b.changePercent);
  } else if (sort === 'volume') {
    result.sort((a, b) => b.volume - a.volume);
  }

  res.json({
    code: 0,
    data: result,
  });
});

// 获取单只股票详情
app.get('/api/stocks/:code', (req, res) => {
  const { code } = req.params;
  const stock = stocksData.find(s => s.code === code);

  if (!stock) {
    return res.status(404).json({
      code: 404,
      message: '股票不存在',
    });
  }

  res.json({
    code: 0,
    data: stock,
  });
});

// 获取K线数据
app.get('/api/kline/:code', (req, res) => {
  const { code } = req.params;
  const { period = 'day', count = 100 } = req.query;

  let klineData = klineDataCache.get(code);

  if (!klineData) {
    const stock = stocksData.find(s => s.code === code);
    if (!stock) {
      return res.status(404).json({
        code: 404,
        message: '股票不存在',
      });
    }
    klineData = generateKlineData(stock.price, 200);
    klineDataCache.set(code, klineData);
  }

  // 返回最新的count条数据
  const data = klineData.slice(-parseInt(count));

  // 计算技术指标
  const indicators = calculateTechnicalIndicators(data);

  res.json({
    code: 0,
    data: {
      kline: data,
      indicators,
    },
  });
});

// 获取市场概况
app.get('/api/market/overview', (req, res) => {
  const totalStocks = stocksData.length;
  const riseCount = stocksData.filter(s => s.changePercent > 0).length;
  const fallCount = stocksData.filter(s => s.changePercent < 0).length;
  const flatCount = totalStocks - riseCount - fallCount;

  const topGainers = [...stocksData]
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 5);

  const topLosers = [...stocksData]
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 5);

  const topVolume = [...stocksData]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);

  res.json({
    code: 0,
    data: {
      total: totalStocks,
      rise: riseCount,
      fall: fallCount,
      flat: flatCount,
      topGainers,
      topLosers,
      topVolume,
    },
  });
});

// 获取股票新闻
app.get('/api/news/:code', (req, res) => {
  const { code } = req.params;
  const stock = stocksData.find(s => s.code === code);

  if (!stock) {
    return res.status(404).json({
      code: 404,
      message: '股票不存在',
    });
  }

  const news = getStockNews(code);

  res.json({
    code: 0,
    data: news,
  });
});

// AI问答接口
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({
        code: 400,
        message: '消息不能为空',
      });
    }

    // 调用AI服务
    const result = await aiService.chat(message, context, 'analysis');

    res.json({
      code: 0,
      data: {
        answer: result.answer,
        provider: result.provider,
        model: result.model,
        success: result.success,
      },
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      code: 500,
      message: 'AI服务错误',
      error: error.message,
    });
  }
});

// 网络搜索接口
app.post('/api/search/stock', async (req, res) => {
  try {
    const { stockName, stockCode, query } = req.body;

    if (!stockName || !stockCode) {
      return res.status(400).json({
        code: 400,
        message: '股票名称和代码不能为空',
      });
    }

    // 搜索股票相关信息
    const searchResult = await searchService.searchStockInfo(
      stockName,
      stockCode,
      query || ''
    );

    // 如果搜索成功，使用AI总结结果
    let summary = '';
    if (searchResult.success && searchResult.results.length > 0) {
      const searchInfo = searchService.extractKeyInfo(searchResult.results);
      const summaryResult = await aiService.chat(
        `请总结以下搜索结果，提取关键信息并分析对${stockName}股价的可能影响：\n\n${searchInfo}`,
        {},
        'search'
      );
      summary = summaryResult.answer;
    }

    res.json({
      code: 0,
      data: {
        query: searchResult.query,
        results: searchResult.results,
        summary: summary,
        source: searchResult.source,
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      code: 500,
      message: '搜索服务错误',
      error: error.message,
    });
  }
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// WebSocket服务器用于实时数据推送
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  // 每2秒推送一次实时价格更新
  const interval = setInterval(() => {
    const updates = stocksData.slice(0, 20).map(stock => {
      const newPrice = generateRealtimePrice(stock.price);
      const change = newPrice - stock.price;
      const changePercent = (change / stock.price) * 100;

      return {
        code: stock.code,
        name: stock.name,
        price: newPrice,
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
      };
    });

    ws.send(JSON.stringify({
      type: 'price_update',
      data: updates,
    }));
  }, 2000);

  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clearInterval(interval);
  });
});

export default app;
