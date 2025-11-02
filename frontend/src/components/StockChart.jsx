import React, { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

/**
 * 股票图表组件
 * 支持线图、面积图和柱状图
 */
const StockChart = ({ data, type = 'area', indicators = {} }) => {
  const [selectedIndicators, setSelectedIndicators] = useState({
    ma5: true,
    ma20: false,
    ma60: false,
  });

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <p className="text-gray-500">暂无数据</p>
      </div>
    );
  }

  // 格式化日期
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 合并数据和指标
  const chartData = data.map((item, index) => {
    const point = {
      date: formatDate(item.timestamp || item.date),
      price: item.close,
      volume: item.volume,
      high: item.high,
      low: item.low,
      open: item.open,
    };

    // 添加技术指标
    if (indicators.ma5 && indicators.ma5[index]) {
      point.ma5 = indicators.ma5[index];
    }
    if (indicators.ma20 && indicators.ma20[index]) {
      point.ma20 = indicators.ma20[index];
    }
    if (indicators.ma60 && indicators.ma60[index]) {
      point.ma60 = indicators.ma60[index];
    }

    return point;
  });

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{payload[0].payload.date}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value?.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // 切换指标
  const toggleIndicator = (indicator) => {
    setSelectedIndicators(prev => ({
      ...prev,
      [indicator]: !prev[indicator]
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      {/* 图表控制 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">价格走势</h3>

        {/* 指标选择器 */}
        {indicators.ma5 && (
          <div className="flex items-center space-x-4">
            <button
              onClick={() => toggleIndicator('ma5')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedIndicators.ma5
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              MA5
            </button>
            <button
              onClick={() => toggleIndicator('ma20')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedIndicators.ma20
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              MA20
            </button>
            <button
              onClick={() => toggleIndicator('ma60')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedIndicators.ma60
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              MA60
            </button>
          </div>
        )}
      </div>

      {/* 主图表 */}
      <ResponsiveContainer width="100%" height={400}>
        {type === 'area' ? (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="price"
              name="价格"
              stroke="#0ea5e9"
              strokeWidth={2}
              fill="url(#colorPrice)"
              animationDuration={1000}
            />
            {selectedIndicators.ma5 && indicators.ma5 && (
              <Line
                type="monotone"
                dataKey="ma5"
                name="MA5"
                stroke="#3b82f6"
                strokeWidth={1.5}
                dot={false}
                animationDuration={1000}
              />
            )}
            {selectedIndicators.ma20 && indicators.ma20 && (
              <Line
                type="monotone"
                dataKey="ma20"
                name="MA20"
                stroke="#f97316"
                strokeWidth={1.5}
                dot={false}
                animationDuration={1000}
              />
            )}
            {selectedIndicators.ma60 && indicators.ma60 && (
              <Line
                type="monotone"
                dataKey="ma60"
                name="MA60"
                stroke="#a855f7"
                strokeWidth={1.5}
                dot={false}
                animationDuration={1000}
              />
            )}
          </AreaChart>
        ) : type === 'line' ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="price"
              name="价格"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              animationDuration={1000}
            />
          </LineChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="volume"
              name="成交量"
              fill="#0ea5e9"
              animationDuration={1000}
            />
          </BarChart>
        )}
      </ResponsiveContainer>

      {/* 成交量图表 */}
      <div className="mt-8">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">成交量</h4>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: '10px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '10px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="volume"
              fill="#94a3b8"
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default StockChart;
