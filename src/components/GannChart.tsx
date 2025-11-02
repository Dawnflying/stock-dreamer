import ReactECharts from 'echarts-for-react';
import { motion } from 'framer-motion';
import { Info, TrendingUp, TrendingDown } from 'lucide-react';
import type { KlineData } from '@/types';
import type { GannAnalysis } from '@/utils/gannAnalysis';
import { performGannAnalysis } from '@/utils/gannAnalysis';
import { useState, useEffect } from 'react';

interface GannChartProps {
  data: KlineData[];
  currentPrice: number;
}

export default function GannChart({ data, currentPrice }: GannChartProps) {
  const [analysis, setAnalysis] = useState<GannAnalysis | null>(null);
  const [showAngles, setShowAngles] = useState(true);
  const [showSquare, setShowSquare] = useState(true);

  useEffect(() => {
    const gannAnalysis = performGannAnalysis(data, currentPrice);
    setAnalysis(gannAnalysis);
  }, [data, currentPrice]);

  if (!analysis) return null;

  const dates = data.map(item => item.date);
  const klineData = data.map(item => [item.open, item.close, item.low, item.high]);

  const getChartOption = () => {
    const series: any[] = [
      {
        name: 'K线',
        type: 'candlestick',
        data: klineData,
        itemStyle: {
          color: '#f5222d',
          color0: '#52c41a',
          borderColor: '#f5222d',
          borderColor0: '#52c41a',
        },
      },
    ];

    // 添加江恩角度线
    if (showAngles) {
      analysis.angles.forEach(angle => {
        // 只显示关键角度线
        if (['1x1', '1x2', '2x1'].includes(angle.name)) {
          series.push({
            name: `江恩 ${angle.name}`,
            type: 'line',
            data: angle.points.map(p => p.y),
            lineStyle: {
              color: angle.color,
              width: angle.name === '1x1' ? 2 : 1,
              type: angle.name === '1x1' ? 'solid' : 'dashed',
            },
            showSymbol: false,
            smooth: false,
          });
        }
      });
    }

    // 添加江恩方阵价格线
    if (showSquare) {
      analysis.square.levels.forEach(level => {
        const sqrt = Math.sqrt(level);
        const isSquare = Math.abs(sqrt - Math.round(sqrt)) < 0.01;

        series.push({
          name: `江恩方阵 ${level}`,
          type: 'line',
          markLine: {
            silent: true,
            symbol: 'none',
            label: {
              show: true,
              position: 'end',
              formatter: `${level.toFixed(2)}`,
              fontSize: 10,
            },
            lineStyle: {
              color: isSquare ? '#722ed1' : '#d3adf7',
              width: isSquare ? 2 : 1,
              type: isSquare ? 'solid' : 'dashed',
            },
            data: [{ yAxis: level }],
          },
        });
      });
    }

    return {
      animation: true,
      backgroundColor: 'transparent',
      grid: {
        left: '10%',
        right: '15%',
        top: '10%',
        bottom: '15%',
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: '#666' } },
      },
      yAxis: {
        scale: true,
        splitLine: { show: true, lineStyle: { color: '#eee' } },
        axisLine: { lineStyle: { color: '#666' } },
      },
      series,
      dataZoom: [
        {
          type: 'inside',
          start: 50,
          end: 100,
        },
        {
          show: true,
          type: 'slider',
          bottom: '5%',
          start: 50,
          end: 100,
        },
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#ccc',
        textStyle: { color: '#333' },
      },
      legend: {
        data: ['K线', '江恩 1x1', '江恩 1x2', '江恩 2x1'],
        top: 0,
        textStyle: { color: '#666' },
      },
    };
  };

  const supportLevels = analysis.predictions.filter(p => p.type === 'support');
  const resistanceLevels = analysis.predictions.filter(p => p.type === 'resistance');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
          <span>江恩理论分析</span>
          <Info className="w-4 h-4 text-gray-400" />
        </h3>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAngles(!showAngles)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showAngles
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            角度线
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSquare(!showSquare)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showSquare
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            方阵价位
          </motion.button>
        </div>
      </div>

      {/* 图表 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-white rounded-xl p-4"
      >
        <ReactECharts option={getChartOption()} style={{ height: '500px' }} />
      </motion.div>

      {/* 分析面板 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 支撑位 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-white rounded-xl p-4"
        >
          <div className="flex items-center space-x-2 mb-3">
            <TrendingDown className="w-5 h-5 text-green-600" />
            <h4 className="font-bold text-gray-800">支撑位</h4>
          </div>
          <div className="space-y-2">
            {supportLevels.slice(0, 5).map((level, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-green-50 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-700">
                  ${level.level.toFixed(2)}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    level.strength === 'strong'
                      ? 'bg-green-600 text-white'
                      : level.strength === 'medium'
                      ? 'bg-green-400 text-white'
                      : 'bg-green-200 text-green-800'
                  }`}
                >
                  {level.strength === 'strong' ? '强' : level.strength === 'medium' ? '中' : '弱'}
                </span>
              </div>
            ))}
            {supportLevels.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">暂无支撑位</p>
            )}
          </div>
        </motion.div>

        {/* 阻力位 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-white rounded-xl p-4"
        >
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <h4 className="font-bold text-gray-800">阻力位</h4>
          </div>
          <div className="space-y-2">
            {resistanceLevels.slice(0, 5).map((level, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-red-50 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-700">
                  ${level.level.toFixed(2)}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    level.strength === 'strong'
                      ? 'bg-red-600 text-white'
                      : level.strength === 'medium'
                      ? 'bg-red-400 text-white'
                      : 'bg-red-200 text-red-800'
                  }`}
                >
                  {level.strength === 'strong' ? '强' : level.strength === 'medium' ? '中' : '弱'}
                </span>
              </div>
            ))}
            {resistanceLevels.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">暂无阻力位</p>
            )}
          </div>
        </motion.div>

        {/* 时间周期 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-white rounded-xl p-4"
        >
          <div className="flex items-center space-x-2 mb-3">
            <Info className="w-5 h-5 text-purple-600" />
            <h4 className="font-bold text-gray-800">关键周期</h4>
          </div>
          <div className="space-y-2">
            {analysis.cycles.slice(0, 5).map((cycle, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-purple-50 rounded-lg"
              >
                <div>
                  <div className="text-sm font-medium text-gray-700">
                    {cycle.description}
                  </div>
                  <div className="text-xs text-gray-500">{cycle.date}</div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    cycle.type === 'major'
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-200 text-purple-800'
                  }`}
                >
                  {cycle.type === 'major' ? '主要' : '次要'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* 江恩方阵说明 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-white rounded-xl p-4"
      >
        <h4 className="font-bold text-gray-800 mb-2">江恩方阵中心</h4>
        <div className="flex items-center space-x-4">
          <div className="text-3xl font-bold text-purple-600">
            {analysis.square.center.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">
            <p>当前价格：${currentPrice.toFixed(2)}</p>
            <p className="text-xs text-gray-500">
              方阵中心为 {Math.sqrt(analysis.square.center).toFixed(0)}² = {analysis.square.center.toFixed(2)}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
