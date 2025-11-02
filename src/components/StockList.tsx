import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown } from 'lucide-react';
import { api } from '@/services/api';
import { useStore } from '@/store/useStore';
import type { Stock } from '@/types';
import StockCard from './StockCard';

interface StockListProps {
  showFavoritesOnly?: boolean;
}

export default function StockList({ showFavoritesOnly = false }: StockListProps) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('');
  const { searchKeyword, favorites } = useStore();

  useEffect(() => {
    loadStocks();
  }, [searchKeyword, sortBy]);

  const loadStocks = async () => {
    try {
      setLoading(true);
      const data = await api.getStocks({
        keyword: searchKeyword,
        sort: sortBy,
      });
      setStocks(data);
    } catch (error) {
      console.error('Failed to load stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayStocks = showFavoritesOnly
    ? stocks.filter(stock => favorites.includes(stock.code))
    : stocks;

  const handleSort = (type: string) => {
    setSortBy(sortBy === type ? `-${type}` : type);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          {showFavoritesOnly ? '我的自选' : '股票列表'}
          <span className="ml-2 text-sm font-normal text-white/80">
            ({displayStocks.length})
          </span>
        </h2>

        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSort('change')}
            className="flex items-center space-x-2 px-4 py-2 glass-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>涨跌幅</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSort('volume')}
            className="flex items-center space-x-2 px-4 py-2 glass-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>成交量</span>
          </motion.button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-white rounded-xl p-6 skeleton h-48" />
          ))}
        </div>
      ) : displayStocks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-white rounded-xl p-12 text-center"
        >
          <p className="text-gray-500">
            {showFavoritesOnly ? '暂无自选股票' : '未找到相关股票'}
          </p>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {displayStocks.map((stock, index) => (
            <StockCard key={stock.code} stock={stock} index={index} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
