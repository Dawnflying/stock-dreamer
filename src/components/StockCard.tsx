import { motion } from 'framer-motion';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import type { Stock } from '@/types';
import clsx from 'clsx';

interface StockCardProps {
  stock: Stock;
  index: number;
}

export default function StockCard({ stock, index }: StockCardProps) {
  const navigate = useNavigate();
  const { isFavorite, addFavorite, removeFavorite, priceUpdates } = useStore();
  const isFav = isFavorite(stock.code);

  // 获取实时价格更新
  const priceUpdate = priceUpdates.get(stock.code);
  const displayPrice = priceUpdate?.price || stock.price;
  const displayChange = priceUpdate?.change || stock.change;
  const displayChangePercent = priceUpdate?.changePercent || stock.changePercent;

  const isRise = displayChangePercent > 0;
  const isFall = displayChangePercent < 0;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFav) {
      removeFavorite(stock.code);
    } else {
      addFavorite(stock.code);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => navigate(`/stock/${stock.code}`)}
      className="glass-white rounded-xl p-5 cursor-pointer card-hover"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-gray-800">{stock.name}</h3>
            <span className="text-sm text-gray-500">{stock.code}</span>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
              {stock.sector}
            </span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleFavoriteClick}
          className={clsx(
            'p-2 rounded-lg transition-colors',
            isFav ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'
          )}
        >
          <Star className="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} />
        </motion.button>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">
              ${displayPrice.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <span
              className={clsx(
                'text-sm font-medium',
                isRise && 'text-rise',
                isFall && 'text-fall'
              )}
            >
              {displayChange >= 0 ? '+' : ''}{displayChange.toFixed(2)}
            </span>
            <span
              className={clsx(
                'flex items-center space-x-1 text-sm font-medium px-2 py-1 rounded',
                isRise && 'bg-rise text-white',
                isFall && 'bg-fall text-white',
                !isRise && !isFall && 'bg-gray-200 text-gray-600'
              )}
            >
              {isRise && <TrendingUp className="w-3 h-3" />}
              {isFall && <TrendingDown className="w-3 h-3" />}
              <span>{displayChangePercent >= 0 ? '+' : ''}{displayChangePercent.toFixed(2)}%</span>
            </span>
          </div>
        </div>

        <div className="text-right text-sm text-gray-500">
          <div>成交量</div>
          <div className="font-medium text-gray-700">
            {(stock.volume / 1000000).toFixed(2)}M
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="text-xs text-gray-500">最高</div>
          <div className="text-sm font-medium text-gray-700">${stock.high.toFixed(2)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">最低</div>
          <div className="text-sm font-medium text-gray-700">${stock.low.toFixed(2)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">开盘</div>
          <div className="text-sm font-medium text-gray-700">${stock.open.toFixed(2)}</div>
        </div>
      </div>
    </motion.div>
  );
}
