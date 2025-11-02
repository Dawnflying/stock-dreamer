import type { Stock, KlineData, TechnicalIndicators } from '@/types';
import type { GannAnalysis } from './gannAnalysis';

export interface AnalysisContext {
  stock: Stock;
  klineData: KlineData[];
  indicators: TechnicalIndicators;
  gannAnalysis: GannAnalysis;
}

// 生成智能分析回答
export function generateAIAnswer(question: string, context: AnalysisContext): {
  answer: string;
  confidence: number;
  relatedFactors: string[];
} {
  const { stock, klineData, indicators, gannAnalysis } = context;
  const questionLower = question.toLowerCase();

  // 趋势分析
  if (questionLower.includes('趋势') || questionLower.includes('走势') || questionLower.includes('方向')) {
    return analyzeTrend(context);
  }

  // 买卖建议
  if (questionLower.includes('买') || questionLower.includes('卖') || questionLower.includes('操作')) {
    return analyzeTradingAdvice(context);
  }

  // 支撑阻力
  if (questionLower.includes('支撑') || questionLower.includes('阻力') || questionLower.includes('压力')) {
    return analyzeSupportResistance(context);
  }

  // 技术指标
  if (questionLower.includes('指标') || questionLower.includes('macd') || questionLower.includes('rsi') || questionLower.includes('kdj')) {
    return analyzeTechnicalIndicators(context);
  }

  // 江恩分析
  if (questionLower.includes('江恩') || questionLower.includes('周期') || questionLower.includes('方阵')) {
    return analyzeGann(context);
  }

  // 风险评估
  if (questionLower.includes('风险') || questionLower.includes('波动')) {
    return analyzeRisk(context);
  }

  // 估值分析
  if (questionLower.includes('估值') || questionLower.includes('价值') || questionLower.includes('市值')) {
    return analyzeValuation(context);
  }

  // 默认综合分析
  return analyzeComprehensive(context);
}

function analyzeTrend(context: AnalysisContext) {
  const { stock, klineData, indicators } = context;
  const recentData = klineData.slice(-20);
  const ma5 = indicators.ma5.slice(-1)[0] || 0;
  const ma10 = indicators.ma10.slice(-1)[0] || 0;
  const ma20 = indicators.ma20.slice(-1)[0] || 0;
  const currentPrice = stock.price;

  let trend = '';
  let strength = 0;
  const factors: string[] = [];

  // 判断均线排列
  if (ma5 > ma10 && ma10 > ma20 && currentPrice > ma5) {
    trend = '多头排列，上升趋势';
    strength = 0.85;
    factors.push('均线呈多头排列');
    factors.push(`当前价格(${currentPrice.toFixed(2)})位于MA5上方`);
  } else if (ma5 < ma10 && ma10 < ma20 && currentPrice < ma5) {
    trend = '空头排列，下降趋势';
    strength = 0.8;
    factors.push('均线呈空头排列');
    factors.push(`当前价格(${currentPrice.toFixed(2)})位于MA5下方`);
  } else {
    trend = '震荡整理，方向不明';
    strength = 0.6;
    factors.push('均线缠绕，趋势不明确');
  }

  // 分析价格动量
  const priceChange = (currentPrice - recentData[0].close) / recentData[0].close;
  if (Math.abs(priceChange) > 0.1) {
    factors.push(`近期涨跌幅${(priceChange * 100).toFixed(2)}%，动量${priceChange > 0 ? '强劲' : '疲软'}`);
    strength += 0.1;
  }

  const answer = `根据技术分析，${stock.name}(${stock.code})当前呈现${trend}。\n\n` +
    `价格分析：当前价格为$${currentPrice.toFixed(2)}，${stock.changePercent >= 0 ? '上涨' : '下跌'}${Math.abs(stock.changePercent).toFixed(2)}%。` +
    `MA5为$${ma5.toFixed(2)}，MA10为$${ma10.toFixed(2)}，MA20为$${ma20.toFixed(2)}。\n\n` +
    `建议：${trend.includes('上升') ? '可关注回调买入机会' : trend.includes('下降') ? '建议观望或减仓' : '等待方向明朗后再决策'}。`;

  return {
    answer,
    confidence: Math.min(strength, 1),
    relatedFactors: factors,
  };
}

function analyzeTradingAdvice(context: AnalysisContext) {
  const { stock, indicators, gannAnalysis } = context;
  const rsi = indicators.rsi.slice(-1)[0] || 50;
  const macd = indicators.macd.macd.slice(-1)[0] || 0;
  const kdj_k = indicators.kdj.k.slice(-1)[0] || 50;

  const factors: string[] = [];
  let advice = '';
  let confidence = 0.7;

  // RSI分析
  if (rsi < 30) {
    advice = '超卖区域，可考虑分批买入';
    factors.push(`RSI(${rsi.toFixed(2)})处于超卖区`);
    confidence += 0.15;
  } else if (rsi > 70) {
    advice = '超买区域，建议减仓或止盈';
    factors.push(`RSI(${rsi.toFixed(2)})处于超买区`);
    confidence += 0.15;
  } else {
    advice = '指标处于中性区域，可根据趋势判断';
    factors.push(`RSI(${rsi.toFixed(2)})处于中性区`);
  }

  // MACD分析
  if (macd > 0) {
    factors.push('MACD柱状图为正，多头力量占优');
    if (!advice.includes('买入')) {
      confidence += 0.05;
    }
  } else {
    factors.push('MACD柱状图为负，空头力量占优');
    if (advice.includes('买入')) {
      confidence -= 0.1;
    }
  }

  // 江恩支撑阻力
  const nearSupport = gannAnalysis.predictions.find(
    p => p.type === 'support' && Math.abs(p.level - stock.price) < stock.price * 0.02
  );
  const nearResistance = gannAnalysis.predictions.find(
    p => p.type === 'resistance' && Math.abs(p.level - stock.price) < stock.price * 0.02
  );

  if (nearSupport) {
    factors.push(`接近江恩支撑位$${nearSupport.level.toFixed(2)}`);
    confidence += 0.05;
  }
  if (nearResistance) {
    factors.push(`接近江恩阻力位$${nearResistance.level.toFixed(2)}`);
  }

  const answer = `操作建议：${advice}\n\n` +
    `当前价格：$${stock.price.toFixed(2)}\n` +
    `技术指标：RSI=${rsi.toFixed(2)}, KDJ_K=${kdj_k?.toFixed(2) || 'N/A'}\n\n` +
    `风险提示：以上建议仅供参考，请结合自身风险承受能力和投资策略做出决策。建议设置止损位以控制风险。`;

  return {
    answer,
    confidence: Math.min(confidence, 0.95),
    relatedFactors: factors,
  };
}

function analyzeSupportResistance(context: AnalysisContext) {
  const { stock, gannAnalysis } = context;
  const supports = gannAnalysis.predictions.filter(p => p.type === 'support').slice(0, 3);
  const resistances = gannAnalysis.predictions.filter(p => p.type === 'resistance').slice(0, 3);

  const factors: string[] = [];

  let answer = `${stock.name}的关键价位分析：\n\n`;

  if (supports.length > 0) {
    answer += '支撑位：\n';
    supports.forEach(s => {
      answer += `  • $${s.level.toFixed(2)} (${s.strength === 'strong' ? '强' : s.strength === 'medium' ? '中' : '弱'}支撑)\n`;
      factors.push(`支撑位$${s.level.toFixed(2)}`);
    });
    answer += '\n';
  }

  if (resistances.length > 0) {
    answer += '阻力位：\n';
    resistances.forEach(r => {
      answer += `  • $${r.level.toFixed(2)} (${r.strength === 'strong' ? '强' : r.strength === 'medium' ? '中' : '弱'}阻力)\n`;
      factors.push(`阻力位$${r.level.toFixed(2)}`);
    });
    answer += '\n';
  }

  answer += `当前价格：$${stock.price.toFixed(2)}\n\n`;
  answer += '这些关键价位基于江恩理论和历史价格行为计算得出，可作为交易决策的重要参考。';

  return {
    answer,
    confidence: 0.8,
    relatedFactors: factors,
  };
}

function analyzeTechnicalIndicators(context: AnalysisContext) {
  const { stock, indicators } = context;
  const rsi = indicators.rsi.slice(-1)[0] || 50;
  const macd = indicators.macd;
  const kdj = indicators.kdj;

  const latestMACD = {
    dif: macd.dif.slice(-1)[0] || 0,
    dea: macd.dea.slice(-1)[0] || 0,
    macd: macd.macd.slice(-1)[0] || 0,
  };

  const latestKDJ = {
    k: kdj.k.slice(-1)[0] || 50,
    d: kdj.d.slice(-1)[0] || 50,
    j: kdj.j.slice(-1)[0] || 50,
  };

  const factors: string[] = [];

  let answer = `${stock.name}技术指标分析：\n\n`;

  // RSI分析
  answer += `RSI指标：${rsi.toFixed(2)}\n`;
  if (rsi < 30) {
    answer += '  → 超卖信号，可能出现反弹\n';
    factors.push('RSI超卖');
  } else if (rsi > 70) {
    answer += '  → 超买信号，注意回调风险\n';
    factors.push('RSI超买');
  } else {
    answer += '  → 中性区域\n';
  }
  answer += '\n';

  // MACD分析
  answer += `MACD指标：\n`;
  answer += `  DIF: ${latestMACD.dif.toFixed(2)}\n`;
  answer += `  DEA: ${latestMACD.dea.toFixed(2)}\n`;
  answer += `  MACD: ${latestMACD.macd.toFixed(2)}\n`;
  if (latestMACD.dif > latestMACD.dea && latestMACD.macd > 0) {
    answer += '  → 金叉且柱状图为正，看涨信号\n';
    factors.push('MACD金叉');
  } else if (latestMACD.dif < latestMACD.dea && latestMACD.macd < 0) {
    answer += '  → 死叉且柱状图为负，看跌信号\n';
    factors.push('MACD死叉');
  }
  answer += '\n';

  // KDJ分析
  answer += `KDJ指标：\n`;
  answer += `  K: ${latestKDJ.k?.toFixed(2) || 'N/A'}\n`;
  answer += `  D: ${latestKDJ.d?.toFixed(2) || 'N/A'}\n`;
  answer += `  J: ${latestKDJ.j?.toFixed(2) || 'N/A'}\n`;
  if (latestKDJ.k && latestKDJ.k < 20) {
    answer += '  → 超卖区域，可能反弹\n';
    factors.push('KDJ超卖');
  } else if (latestKDJ.k && latestKDJ.k > 80) {
    answer += '  → 超买区域，注意风险\n';
    factors.push('KDJ超买');
  }

  return {
    answer,
    confidence: 0.85,
    relatedFactors: factors,
  };
}

function analyzeGann(context: AnalysisContext) {
  const { stock, gannAnalysis } = context;
  const factors: string[] = [];

  let answer = `${stock.name}江恩理论分析：\n\n`;

  // 方阵分析
  answer += `江恩方阵中心：${gannAnalysis.square.center.toFixed(2)}\n`;
  answer += `  (${Math.sqrt(gannAnalysis.square.center).toFixed(0)}的平方)\n\n`;
  factors.push(`方阵中心${gannAnalysis.square.center.toFixed(2)}`);

  // 周期分析
  if (gannAnalysis.cycles.length > 0) {
    answer += `重要时间周期：\n`;
    gannAnalysis.cycles.slice(0, 3).forEach(cycle => {
      answer += `  • ${cycle.description} (${cycle.date})\n`;
      factors.push(cycle.description);
    });
    answer += '\n';
  }

  // 角度线分析
  answer += `江恩角度线分析：\n`;
  answer += `  1x1线（45度）是最重要的趋势线\n`;
  answer += `  当前价格相对于1x1线的位置决定了趋势强度\n\n`;

  answer += `根据江恩理论，当价格突破关键方阵价位时，往往预示着趋势的转变。`;

  return {
    answer,
    confidence: 0.75,
    relatedFactors: factors,
  };
}

function analyzeRisk(context: AnalysisContext) {
  const { stock, klineData } = context;
  const recentData = klineData.slice(-20);

  // 计算波动率
  const returns = recentData.slice(1).map((d, i) =>
    (d.close - recentData[i].close) / recentData[i].close
  );
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100; // 年化波动率

  const factors: string[] = [];
  let riskLevel = '';

  if (volatility < 20) {
    riskLevel = '低';
    factors.push('波动率较低');
  } else if (volatility < 40) {
    riskLevel = '中';
    factors.push('波动率适中');
  } else {
    riskLevel = '高';
    factors.push('波动率较高');
  }

  // 分析涨跌幅
  if (Math.abs(stock.changePercent) > 5) {
    factors.push('单日涨跌幅较大');
    riskLevel = riskLevel === '低' ? '中' : '高';
  }

  const answer = `${stock.name}风险评估：\n\n` +
    `风险等级：${riskLevel}\n` +
    `年化波动率：${volatility.toFixed(2)}%\n` +
    `当日涨跌幅：${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%\n\n` +
    `建议：${riskLevel === '高' ? '高风险资产，建议严格控制仓位，设置止损' :
            riskLevel === '中' ? '适度风险，建议合理配置仓位' :
            '相对稳健，但仍需关注市场变化'}。`;

  return {
    answer,
    confidence: 0.8,
    relatedFactors: factors,
  };
}

function analyzeValuation(context: AnalysisContext) {
  const { stock } = context;
  const factors: string[] = [];

  const marketCapB = (stock.marketCap / 1000000000).toFixed(2);
  factors.push(`市值${marketCapB}B`);

  let answer = `${stock.name}估值分析：\n\n`;
  answer += `当前价格：$${stock.price.toFixed(2)}\n`;
  answer += `市值：$${marketCapB}B\n`;
  answer += `行业：${stock.sector}\n\n`;

  answer += `相对估值需要结合行业平均水平、公司基本面、增长前景等多方面因素综合判断。\n`;
  answer += `建议关注公司的盈利能力、现金流、负债率等财务指标。`;

  return {
    answer,
    confidence: 0.65,
    relatedFactors: factors,
  };
}

function analyzeComprehensive(context: AnalysisContext) {
  const { stock, indicators, gannAnalysis } = context;
  const rsi = indicators.rsi.slice(-1)[0] || 50;
  const factors: string[] = [];

  let answer = `${stock.name}(${stock.code})综合分析：\n\n`;

  // 价格状态
  answer += `价格：$${stock.price.toFixed(2)} (${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)\n`;
  answer += `成交量：${(stock.volume / 1000000).toFixed(2)}M\n`;
  answer += `市值：$${(stock.marketCap / 1000000000).toFixed(2)}B\n\n`;

  // 技术面
  answer += `技术面：RSI=${rsi.toFixed(2)}`;
  if (rsi < 30) {
    answer += ' (超卖)\n';
    factors.push('技术面超卖');
  } else if (rsi > 70) {
    answer += ' (超买)\n';
    factors.push('技术面超买');
  } else {
    answer += ' (中性)\n';
  }

  // 关键价位
  const nearestSupport = gannAnalysis.predictions.find(p => p.type === 'support' && p.level < stock.price);
  const nearestResistance = gannAnalysis.predictions.find(p => p.type === 'resistance' && p.level > stock.price);

  if (nearestSupport) {
    answer += `支撑位：$${nearestSupport.level.toFixed(2)}\n`;
    factors.push(`支撑$${nearestSupport.level.toFixed(2)}`);
  }
  if (nearestResistance) {
    answer += `阻力位：$${nearestResistance.level.toFixed(2)}\n`;
    factors.push(`阻力$${nearestResistance.level.toFixed(2)}`);
  }

  answer += `\n建议投资者结合基本面、技术面和风险偏好做出决策。`;

  return {
    answer,
    confidence: 0.75,
    relatedFactors: factors,
  };
}
