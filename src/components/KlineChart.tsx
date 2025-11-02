import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import type { KlineData, TechnicalIndicators } from '@/types';
import { motion } from 'framer-motion';

interface KlineChartProps {
  data: KlineData[];
  indicators: TechnicalIndicators;
}

export default function KlineChart({ data, indicators }: KlineChartProps) {
  const [selectedIndicator, setSelectedIndicator] = useState<'MA' | 'MACD' | 'RSI' | 'KDJ'>('MA');

  const dates = data.map(item => item.date);
  const klineData = data.map(item => [item.open, item.close, item.low, item.high]);
  const volumes = data.map(item => item.volume);

  // 计算颜色（红涨绿跌）
  const volumeColors = data.map(item =>
    item.close >= item.open ? '#f5222d' : '#52c41a'
  );

  const getMainOption = () => {
    const option: any = {
      animation: true,
      backgroundColor: 'transparent',
      grid: [
        { left: '10%', right: '10%', top: '10%', height: '50%' },
        { left: '10%', right: '10%', top: '65%', height: '15%' },
      ],
      xAxis: [
        {
          type: 'category',
          data: dates,
          gridIndex: 0,
          axisLine: { lineStyle: { color: '#666' } },
        },
        {
          type: 'category',
          data: dates,
          gridIndex: 1,
          axisLine: { lineStyle: { color: '#666' } },
        },
      ],
      yAxis: [
        {
          scale: true,
          gridIndex: 0,
          splitLine: { show: true, lineStyle: { color: '#eee' } },
          axisLine: { lineStyle: { color: '#666' } },
        },
        {
          scale: true,
          gridIndex: 1,
          splitNumber: 2,
          axisLine: { show: false },
          splitLine: { show: false },
        },
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1],
          start: 70,
          end: 100,
        },
        {
          show: true,
          xAxisIndex: [0, 1],
          type: 'slider',
          bottom: '5%',
          start: 70,
          end: 100,
        },
      ],
      series: [
        {
          name: 'K线',
          type: 'candlestick',
          data: klineData,
          xAxisIndex: 0,
          yAxisIndex: 0,
          itemStyle: {
            color: '#f5222d',
            color0: '#52c41a',
            borderColor: '#f5222d',
            borderColor0: '#52c41a',
          },
        },
        {
          name: '成交量',
          type: 'bar',
          data: volumes,
          xAxisIndex: 1,
          yAxisIndex: 1,
          itemStyle: {
            color: (params: any) => volumeColors[params.dataIndex],
          },
        },
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#ccc',
        textStyle: {
          color: '#333',
        },
      },
    };

    // 添加选中的技术指标
    if (selectedIndicator === 'MA') {
      option.series.push(
        {
          name: 'MA5',
          type: 'line',
          data: indicators.ma5,
          smooth: true,
          lineStyle: { width: 1, color: '#1890ff' },
          showSymbol: false,
          xAxisIndex: 0,
          yAxisIndex: 0,
        },
        {
          name: 'MA10',
          type: 'line',
          data: indicators.ma10,
          smooth: true,
          lineStyle: { width: 1, color: '#52c41a' },
          showSymbol: false,
          xAxisIndex: 0,
          yAxisIndex: 0,
        },
        {
          name: 'MA20',
          type: 'line',
          data: indicators.ma20,
          smooth: true,
          lineStyle: { width: 1, color: '#fa8c16' },
          showSymbol: false,
          xAxisIndex: 0,
          yAxisIndex: 0,
        },
        {
          name: 'MA30',
          type: 'line',
          data: indicators.ma30,
          smooth: true,
          lineStyle: { width: 1, color: '#722ed1' },
          showSymbol: false,
          xAxisIndex: 0,
          yAxisIndex: 0,
        }
      );
    }

    return option;
  };

  const getIndicatorOption = () => {
    if (selectedIndicator === 'MACD') {
      return {
        animation: true,
        backgroundColor: 'transparent',
        grid: { left: '10%', right: '10%', top: '10%', bottom: '15%' },
        xAxis: {
          type: 'category',
          data: dates,
          axisLine: { lineStyle: { color: '#666' } },
        },
        yAxis: {
          scale: true,
          splitLine: { lineStyle: { color: '#eee' } },
          axisLine: { lineStyle: { color: '#666' } },
        },
        series: [
          {
            name: 'MACD',
            type: 'bar',
            data: indicators.macd.macd,
            itemStyle: {
              color: (params: any) =>
                params.data >= 0 ? '#f5222d' : '#52c41a',
            },
          },
          {
            name: 'DIF',
            type: 'line',
            data: indicators.macd.dif,
            smooth: true,
            lineStyle: { width: 2, color: '#1890ff' },
            showSymbol: false,
          },
          {
            name: 'DEA',
            type: 'line',
            data: indicators.macd.dea,
            smooth: true,
            lineStyle: { width: 2, color: '#fa8c16' },
            showSymbol: false,
          },
        ],
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#ccc',
          textStyle: { color: '#333' },
        },
      };
    } else if (selectedIndicator === 'RSI') {
      return {
        animation: true,
        backgroundColor: 'transparent',
        grid: { left: '10%', right: '10%', top: '10%', bottom: '15%' },
        xAxis: {
          type: 'category',
          data: dates,
          axisLine: { lineStyle: { color: '#666' } },
        },
        yAxis: {
          scale: true,
          min: 0,
          max: 100,
          splitLine: { lineStyle: { color: '#eee' } },
          axisLine: { lineStyle: { color: '#666' } },
        },
        series: [
          {
            name: 'RSI',
            type: 'line',
            data: indicators.rsi,
            smooth: true,
            lineStyle: { width: 2, color: '#722ed1' },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(114, 46, 209, 0.3)' },
                  { offset: 1, color: 'rgba(114, 46, 209, 0.05)' },
                ],
              },
            },
          },
        ],
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#ccc',
          textStyle: { color: '#333' },
        },
        markLine: {
          silent: true,
          symbol: 'none',
          data: [
            { yAxis: 70, lineStyle: { color: '#f5222d', type: 'dashed' } },
            { yAxis: 30, lineStyle: { color: '#52c41a', type: 'dashed' } },
          ],
        },
      };
    } else if (selectedIndicator === 'KDJ') {
      return {
        animation: true,
        backgroundColor: 'transparent',
        grid: { left: '10%', right: '10%', top: '10%', bottom: '15%' },
        xAxis: {
          type: 'category',
          data: dates,
          axisLine: { lineStyle: { color: '#666' } },
        },
        yAxis: {
          scale: true,
          min: 0,
          max: 100,
          splitLine: { lineStyle: { color: '#eee' } },
          axisLine: { lineStyle: { color: '#666' } },
        },
        series: [
          {
            name: 'K',
            type: 'line',
            data: indicators.kdj.k,
            smooth: true,
            lineStyle: { width: 2, color: '#1890ff' },
            showSymbol: false,
          },
          {
            name: 'D',
            type: 'line',
            data: indicators.kdj.d,
            smooth: true,
            lineStyle: { width: 2, color: '#fa8c16' },
            showSymbol: false,
          },
          {
            name: 'J',
            type: 'line',
            data: indicators.kdj.j,
            smooth: true,
            lineStyle: { width: 2, color: '#722ed1' },
            showSymbol: false,
          },
        ],
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#ccc',
          textStyle: { color: '#333' },
        },
      };
    }

    return {};
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">技术分析</h3>
        <div className="flex space-x-2">
          {(['MA', 'MACD', 'RSI', 'KDJ'] as const).map((indicator) => (
            <motion.button
              key={indicator}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedIndicator(indicator)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedIndicator === indicator
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {indicator}
            </motion.button>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-white rounded-xl p-4"
      >
        <ReactECharts option={getMainOption()} style={{ height: '500px' }} />
      </motion.div>

      {selectedIndicator !== 'MA' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-white rounded-xl p-4"
        >
          <ReactECharts option={getIndicatorOption()} style={{ height: '250px' }} />
        </motion.div>
      )}
    </div>
  );
}
