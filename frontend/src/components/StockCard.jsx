import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * 股票卡片组件
 * 显示股票的基本信息和价格变动
 */
const StockCard = ({ stock, onClick, selected = false }) => {
  if (!stock) return null;

  const {
    symbol,
    name,
    currentPrice,
    change,
    changePercent,
    volume,
    marketCap
  } = stock;

  const isPositive = change > 0;
  const isNegative = change < 0;

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatVolume = (num) => {
    if (!num) return '0';
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`stock-card ${selected ? 'ring-2 ring-primary-500' : ''}`}
      onClick={() => onClick && onClick(stock)}
    >
      {/* 头部 */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{symbol}</h3>
          <p className="text-sm text-gray-500 truncate max-w-[200px]">{name}</p>
        </div>
        <div className="flex items-center space-x-1">
          {isPositive && <TrendingUp className="w-5 h-5 text-success" />}
          {isNegative && <TrendingDown className="w-5 h-5 text-danger" />}
          {!isPositive && !isNegative && <Minus className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      {/* 价格信息 */}
      <div className="space-y-2">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900">
              ${currentPrice?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-lg font-semibold ${isPositive ? 'price-up' : isNegative ? 'price-down' : 'text-gray-500'}`}>
              {isPositive && '+'}
              {change?.toFixed(2) || '0.00'}
            </p>
            <p className={`text-sm font-medium ${isPositive ? 'price-up' : isNegative ? 'price-down' : 'text-gray-500'}`}>
              {isPositive && '+'}
              {changePercent?.toFixed(2) || '0.00'}%
            </p>
          </div>
        </div>

        {/* 额外信息 */}
        <div className="pt-3 mt-3 border-t border-gray-200 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500">成交量</p>
            <p className="font-semibold text-gray-900">{formatVolume(volume)}</p>
          </div>
          <div>
            <p className="text-gray-500">市值</p>
            <p className="font-semibold text-gray-900">{formatNumber(marketCap)}</p>
          </div>
        </div>
      </div>

      {/* 动画效果背景 */}
      {selected && (
        <motion.div
          className="absolute inset-0 bg-primary-50 rounded-xl -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
};

export default StockCard;
