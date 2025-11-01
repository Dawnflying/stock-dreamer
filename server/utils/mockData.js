// 生成K线数据
export function generateKlineData(basePrice, count) {
  const data = [];
  let currentPrice = basePrice;
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // 随机波动
    const volatility = 0.03; // 3%波动率
    const change = (Math.random() - 0.5) * 2 * currentPrice * volatility;
    currentPrice = Math.max(currentPrice + change, basePrice * 0.5);

    const open = currentPrice;
    const close = open + (Math.random() - 0.5) * 2 * open * volatility;
    const high = Math.max(open, close) * (1 + Math.random() * volatility);
    const low = Math.min(open, close) * (1 - Math.random() * volatility);
    const volume = Math.floor(Math.random() * 10000000) + 1000000;

    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      volume,
    });

    currentPrice = close;
  }

  return data;
}

// 生成实时价格（小幅波动）
export function generateRealtimePrice(basePrice) {
  const volatility = 0.005; // 0.5%波动率
  const change = (Math.random() - 0.5) * 2 * basePrice * volatility;
  return parseFloat((basePrice + change).toFixed(2));
}

// 计算移动平均线
function calculateMA(data, period) {
  const ma = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      ma.push(null);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      ma.push(parseFloat((sum / period).toFixed(2)));
    }
  }
  return ma;
}

// 计算MACD
function calculateMACD(data) {
  const ema12 = [];
  const ema26 = [];
  const dif = [];
  const dea = [];
  const macd = [];

  // 简化版MACD计算
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      ema12.push(data[i].close);
      ema26.push(data[i].close);
    } else {
      ema12.push(parseFloat((ema12[i - 1] * 11 / 13 + data[i].close * 2 / 13).toFixed(2)));
      ema26.push(parseFloat((ema26[i - 1] * 25 / 27 + data[i].close * 2 / 27).toFixed(2)));
    }

    dif.push(parseFloat((ema12[i] - ema26[i]).toFixed(2)));

    if (i === 0) {
      dea.push(dif[i]);
    } else {
      dea.push(parseFloat((dea[i - 1] * 8 / 10 + dif[i] * 2 / 10).toFixed(2)));
    }

    macd.push(parseFloat(((dif[i] - dea[i]) * 2).toFixed(2)));
  }

  return { dif, dea, macd };
}

// 计算RSI
function calculateRSI(data, period = 14) {
  const rsi = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      rsi.push(null);
    } else {
      let gains = 0;
      let losses = 0;

      for (let j = 1; j <= period; j++) {
        const change = data[i - j + 1].close - data[i - j].close;
        if (change > 0) {
          gains += change;
        } else {
          losses += Math.abs(change);
        }
      }

      const avgGain = gains / period;
      const avgLoss = losses / period;
      const rs = avgGain / (avgLoss || 1);
      const rsiValue = 100 - (100 / (1 + rs));

      rsi.push(parseFloat(rsiValue.toFixed(2)));
    }
  }

  return rsi;
}

// 计算KDJ
function calculateKDJ(data, period = 9) {
  const k = [];
  const d = [];
  const j = [];

  let prevK = 50;
  let prevD = 50;

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      k.push(null);
      d.push(null);
      j.push(null);
    } else {
      let highest = data[i].high;
      let lowest = data[i].low;

      for (let m = 0; m < period; m++) {
        highest = Math.max(highest, data[i - m].high);
        lowest = Math.min(lowest, data[i - m].low);
      }

      const rsv = ((data[i].close - lowest) / (highest - lowest || 1)) * 100;
      const kValue = (2 / 3) * prevK + (1 / 3) * rsv;
      const dValue = (2 / 3) * prevD + (1 / 3) * kValue;
      const jValue = 3 * kValue - 2 * dValue;

      k.push(parseFloat(kValue.toFixed(2)));
      d.push(parseFloat(dValue.toFixed(2)));
      j.push(parseFloat(jValue.toFixed(2)));

      prevK = kValue;
      prevD = dValue;
    }
  }

  return { k, d, j };
}

// 计算所有技术指标
export function calculateTechnicalIndicators(data) {
  return {
    ma5: calculateMA(data, 5),
    ma10: calculateMA(data, 10),
    ma20: calculateMA(data, 20),
    ma30: calculateMA(data, 30),
    macd: calculateMACD(data),
    rsi: calculateRSI(data, 14),
    kdj: calculateKDJ(data, 9),
  };
}
