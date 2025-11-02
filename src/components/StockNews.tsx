import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Calendar,
  Tag,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import type { StockNews as StockNewsType } from '@/types';
import { api } from '@/services/api';

interface StockNewsProps {
  stockCode: string;
}

export default function StockNews({ stockCode }: StockNewsProps) {
  const [news, setNews] = useState<StockNewsType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  const [selectedNews, setSelectedNews] = useState<string | null>(null);

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
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'negative':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'negative':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'negative':
        return 'bg-gradient-to-r from-red-500 to-rose-500 text-white';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
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

  // 分析新闻相关因子
  const analyzeNewsFactors = (newsItem: StockNewsType) => {
    const factors = [];

    // 基于标签提取因子
    if (newsItem.tags.includes('产品发布')) factors.push('产品周期');
    if (newsItem.tags.includes('财报发布')) factors.push('业绩周期');
    if (newsItem.tags.includes('营收增长')) factors.push('成长性');
    if (newsItem.tags.includes('技术创新')) factors.push('技术壁垒');
    if (newsItem.tags.includes('市场竞争')) factors.push('竞争格局');
    if (newsItem.tags.includes('战略投资')) factors.push('资本运作');
    if (newsItem.tags.includes('供应链')) factors.push('产业链');
    if (newsItem.tags.includes('监管压力')) factors.push('政策风险');

    // 基于情绪和内容判断影响程度
    const impact = newsItem.sentiment === 'positive' ? '正面' :
                   newsItem.sentiment === 'negative' ? '负面' : '中性';

    return { factors, impact };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton h-40 glass-white rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
            <Newspaper className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">资讯时间线</h3>
            <p className="text-sm text-gray-500">追踪股票相关动态 · {filteredNews.length}条资讯</p>
          </div>
        </div>

        <div className="flex space-x-2">
          {(['all', 'positive', 'neutral', 'negative'] as const).map((type) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === type
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'glass-white text-gray-700 hover:bg-white/80'
              }`}
            >
              {type === 'all' ? '全部' : type === 'positive' ? '利好' : type === 'negative' ? '利空' : '中性'}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-200 via-pink-200 to-transparent" />

        <div className="space-y-6">
          {filteredNews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-white rounded-xl p-12 text-center"
            >
              <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无相关资讯</p>
            </motion.div>
          ) : (
            filteredNews.map((item, index) => {
              const { factors, impact } = analyzeNewsFactors(item);
              const isExpanded = selectedNews === item.id;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-20"
                >
                  {/* Timeline Dot */}
                  <div className={`absolute left-6 w-5 h-5 rounded-full border-4 border-white shadow-lg ${getSentimentBadge(item.sentiment)}`} />

                  {/* News Card */}
                  <motion.div
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="glass-white rounded-xl p-6 cursor-pointer shadow-md hover:shadow-xl transition-all"
                    onClick={() => setSelectedNews(isExpanded ? null : item.id)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 ${getSentimentBadge(item.sentiment)}`}>
                            {getSentimentIcon(item.sentiment)}
                            <span>{getSentimentText(item.sentiment)}</span>
                          </span>
                          <span className="text-xs text-gray-500 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(item.publishTime).toLocaleString('zh-CN')}</span>
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {item.summary}
                        </p>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </motion.div>
                    </div>

                    {/* Tags */}
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-lg text-xs font-medium flex items-center space-x-1"
                          >
                            <Tag className="w-3 h-3" />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-gray-200 pt-4 mt-4">
                            {/* Factor Analysis */}
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4">
                              <div className="flex items-center space-x-2 mb-3">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                                <h5 className="font-bold text-gray-800">相关因子分析</h5>
                              </div>

                              {factors.length > 0 ? (
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">影响因子:</span>
                                    <div className="flex flex-wrap gap-2">
                                      {factors.map((factor, i) => (
                                        <span
                                          key={i}
                                          className="px-3 py-1 bg-white rounded-lg text-sm font-medium text-purple-700 shadow-sm"
                                        >
                                          {factor}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">市场影响:</span>
                                    <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                                      impact === '正面' ? 'bg-green-100 text-green-700' :
                                      impact === '负面' ? 'bg-red-100 text-red-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {impact}影响
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">暂无明确影响因子</p>
                              )}
                            </div>

                            {/* Source and Link */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <span>来源:</span>
                                <span className="font-medium text-gray-700">{item.source}</span>
                              </div>
                              {item.url && (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 text-sm font-medium"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span>查看原文</span>
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
