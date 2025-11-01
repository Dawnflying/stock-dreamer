import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { stocksData } from './data/stocks.js';
import { generateKlineData, generateRealtimePrice, calculateTechnicalIndicators } from './utils/mockData.js';

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
