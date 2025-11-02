import type { KlineData } from '@/types';

export interface GannAngle {
  name: string;
  ratio: number;
  points: { x: number; y: number }[];
  color: string;
}

export interface GannAnalysis {
  angles: GannAngle[];
  square: {
    center: number;
    levels: number[];
  };
  cycles: {
    date: string;
    type: 'major' | 'minor';
    description: string;
  }[];
  predictions: {
    level: number;
    type: 'support' | 'resistance';
    strength: 'strong' | 'medium' | 'weak';
  }[];
}

// 计算江恩角度线
export function calculateGannAngles(data: KlineData[], startIndex: number = 0): GannAngle[] {
  if (data.length === 0 || startIndex >= data.length) return [];

  const startPoint = data[startIndex];
  const startPrice = startPoint.low; // 从最低点开始
  const angles: GannAngle[] = [];

  // 江恩角度线定义：1x8, 1x4, 1x3, 1x2, 1x1, 2x1, 3x1, 4x1, 8x1
  const angleDefinitions = [
    { name: '1x8', ratio: 1 / 8, color: '#d3d3d3' },
    { name: '1x4', ratio: 1 / 4, color: '#b8b8b8' },
    { name: '1x3', ratio: 1 / 3, color: '#a0a0a0' },
    { name: '1x2', ratio: 1 / 2, color: '#ffa500' },
    { name: '1x1', ratio: 1, color: '#ff0000' }, // 最重要的45度线
    { name: '2x1', ratio: 2, color: '#ff8c00' },
    { name: '3x1', ratio: 3, color: '#a0a0a0' },
    { name: '4x1', ratio: 4, color: '#b8b8b8' },
    { name: '8x1', ratio: 8, color: '#d3d3d3' },
  ];

  angleDefinitions.forEach(({ name, ratio, color }) => {
    const points: { x: number; y: number }[] = [];

    for (let i = startIndex; i < data.length; i++) {
      const timeDistance = i - startIndex;
      // 价格变化 = 时间距离 * 比率 * 单位价格变化
      const priceUnit = startPrice * 0.01; // 使用1%作为单位
      const priceChange = timeDistance * ratio * priceUnit;

      points.push({
        x: i,
        y: startPrice + priceChange,
      });
    }

    angles.push({ name, ratio, points, color });
  });

  return angles;
}

// 计算江恩方阵（价格方阵）
export function calculateGannSquare(currentPrice: number): { center: number; levels: number[] } {
  // 找到最接近当前价格的完全平方数
  const sqrt = Math.sqrt(currentPrice);
  const base = Math.round(sqrt);
  const center = base * base;

  // 生成方阵的关键价格位
  const levels: number[] = [];
  for (let i = -3; i <= 3; i++) {
    const level = Math.pow(base + i, 2);
    levels.push(parseFloat(level.toFixed(2)));
  }

  // 添加中间价位
  const halfLevels: number[] = [];
  for (let i = 0; i < levels.length - 1; i++) {
    halfLevels.push(parseFloat(((levels[i] + levels[i + 1]) / 2).toFixed(2)));
  }

  const allLevels = [...levels, ...halfLevels].sort((a, b) => a - b);

  return { center, levels: allLevels };
}

// 计算江恩时间周期
export function calculateGannCycles(data: KlineData[]): {
  date: string;
  type: 'major' | 'minor';
  description: string;
}[] {
  const cycles: { date: string; type: 'major' | 'minor'; description: string }[] = [];

  // 江恩重要周期：7, 30, 45, 60, 90, 120, 144, 180, 360天
  const majorCycles = [30, 60, 90, 120, 144, 180];
  const minorCycles = [7, 15, 45];

  const allCycles = [
    ...majorCycles.map(c => ({ period: c, type: 'major' as const })),
    ...minorCycles.map(c => ({ period: c, type: 'minor' as const })),
  ];

  allCycles.forEach(({ period, type }) => {
    if (data.length >= period) {
      const cycleIndex = data.length - period;
      if (cycleIndex >= 0) {
        cycles.push({
          date: data[cycleIndex].date,
          type,
          description: `${period}天周期`,
        });
      }
    }
  });

  return cycles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// 基于江恩理论预测支撑位和阻力位
export function predictGannLevels(
  data: KlineData[],
  currentPrice: number
): {
  level: number;
  type: 'support' | 'resistance';
  strength: 'strong' | 'medium' | 'weak';
}[] {
  const predictions: {
    level: number;
    type: 'support' | 'resistance';
    strength: 'strong' | 'medium' | 'weak';
  }[] = [];

  // 基于江恩方阵计算
  const square = calculateGannSquare(currentPrice);

  square.levels.forEach(level => {
    if (Math.abs(level - currentPrice) < currentPrice * 0.2) {
      // 在20%范围内
      const distance = Math.abs(level - currentPrice) / currentPrice;
      let strength: 'strong' | 'medium' | 'weak' = 'weak';

      if (distance < 0.02) strength = 'strong'; // 2%以内
      else if (distance < 0.05) strength = 'medium'; // 5%以内

      // 判断是否为完全平方数（更强的支撑/阻力）
      const sqrt = Math.sqrt(level);
      if (Math.abs(sqrt - Math.round(sqrt)) < 0.01) {
        strength = 'strong';
      }

      predictions.push({
        level: parseFloat(level.toFixed(2)),
        type: level > currentPrice ? 'resistance' : 'support',
        strength,
      });
    }
  });

  // 基于历史高低点
  const recentData = data.slice(-60); // 最近60天
  const highs = recentData.map(d => d.high);
  const lows = recentData.map(d => d.low);

  const maxHigh = Math.max(...highs);
  const minLow = Math.min(...lows);

  // 添加历史高低点作为关键位
  if (maxHigh > currentPrice && Math.abs(maxHigh - currentPrice) < currentPrice * 0.15) {
    predictions.push({
      level: parseFloat(maxHigh.toFixed(2)),
      type: 'resistance',
      strength: 'strong',
    });
  }

  if (minLow < currentPrice && Math.abs(currentPrice - minLow) < currentPrice * 0.15) {
    predictions.push({
      level: parseFloat(minLow.toFixed(2)),
      type: 'support',
      strength: 'strong',
    });
  }

  // 去重并排序
  const uniquePredictions = predictions.filter(
    (p, index, self) => index === self.findIndex(t => Math.abs(t.level - p.level) < 0.01)
  );

  return uniquePredictions.sort((a, b) => b.level - a.level);
}

// 完整的江恩分析
export function performGannAnalysis(data: KlineData[], currentPrice: number): GannAnalysis {
  // 找到最近的显著低点作为起点
  const recentData = data.slice(-60);
  let lowestIndex = 0;
  let lowestPrice = recentData[0].low;

  recentData.forEach((d, i) => {
    if (d.low < lowestPrice) {
      lowestPrice = d.low;
      lowestIndex = i;
    }
  });

  const actualStartIndex = data.length - 60 + lowestIndex;

  return {
    angles: calculateGannAngles(data, actualStartIndex),
    square: calculateGannSquare(currentPrice),
    cycles: calculateGannCycles(data),
    predictions: predictGannLevels(data, currentPrice),
  };
}
