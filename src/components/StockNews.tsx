import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, TrendingUp, TrendingDown, Minus, ExternalLink, Calendar, Tag } from 'lucide-react';
import type { StockNews as StockNewsType } from '@/types';
import { api } from '@/services/api';

interface StockNewsProps {
  stockCode: string;
}

export default function StockNews({ stockCode }: StockNewsProps) {
  const [news, setNews] = useState<StockNewsType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');

  useEffect(() => {
    loadNews();
  }, [stockCode]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const data = await api.getStockNews(stockCode);
      setNews(data);
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = filter === 'all'
    ? news
    : news.filter(n => n.sentiment === filter);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSentimentText = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '利好';
      case 'negative':
        return '利空';
      default:
        return '中性';
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton h-32 glass-white rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
          <Newspaper className="w-5 h-5" />
          <span>相关资讯</span>
          <span className="text-sm font-normal text-gray-500">({filteredNews.length})</span>
        </h3>

        <div className="flex space-x-2">
          {(['all', 'positive', 'neutral', 'negative'] as const).map((type) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === type
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? '全部' : type === 'positive' ? '利好' : type === 'negative' ? '利空' : '中性'}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {filteredNews.length === 0 ? (
          <div className="glass-white rounded-xl p-8 text-center text-gray-500">
            暂无资讯
          </div>
        ) : (
          filteredNews.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-white rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 mb-1 line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {item.summary}
                  </p>
                </div>
                <div className={`ml-3 px-2 py-1 rounded-lg border flex items-center space-x-1 ${getSentimentColor(item.sentiment)}`}>
                  {getSentimentIcon(item.sentiment)}
                  <span className="text-xs font-medium whitespace-nowrap">
                    {getSentimentText(item.sentiment)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(item.publishTime).toLocaleDateString('zh-CN')}</span>
                  </span>
                  <span>{item.source}</span>
                </div>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-purple-600 hover:text-purple-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>查看详情</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {item.tags.length > 0 && (
                <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-gray-100">
                  <Tag className="w-3 h-3 text-gray-400" />
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
