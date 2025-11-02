import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { api } from '@/services/api';
import type { MarketOverview as MarketOverviewType } from '@/types';

export default function MarketOverview() {
  const [overview, setOverview] = useState<MarketOverviewType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      const data = await api.getMarketOverview();
      setOverview(data);
    } catch (error) {
      console.error('Failed to load market overview:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !overview) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-white rounded-xl p-6 skeleton h-32" />
        ))}
      </div>
    );
  }

  const risePercent = ((overview.rise / overview.total) * 100).toFixed(1);
  const fallPercent = ((overview.fall / overview.total) * 100).toFixed(1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-white rounded-xl p-6 card-hover"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">总数</p>
            <p className="text-3xl font-bold text-gray-800">{overview.total}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-white rounded-xl p-6 card-hover"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">上涨</p>
            <p className="text-3xl font-bold text-rise">{overview.rise}</p>
            <p className="text-xs text-gray-500 mt-1">{risePercent}%</p>
          </div>
          <div className="bg-gradient-to-br from-red-400 to-red-600 p-3 rounded-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-white rounded-xl p-6 card-hover"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">下跌</p>
            <p className="text-3xl font-bold text-fall">{overview.fall}</p>
            <p className="text-xs text-gray-500 mt-1">{fallPercent}%</p>
          </div>
          <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-lg">
            <TrendingDown className="w-6 h-6 text-white" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-white rounded-xl p-6 card-hover"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">平盘</p>
            <p className="text-3xl font-bold text-gray-800">{overview.flat}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-400 to-gray-600 p-3 rounded-lg">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
