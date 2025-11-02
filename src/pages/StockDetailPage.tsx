import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Activity,
} from 'lucide-react';
import Header from '@/components/Header';
import KlineChart from '@/components/KlineChart';
import GannChart from '@/components/GannChart';
import StockNews from '@/components/StockNews';
import AIAssistant from '@/components/AIAssistant';
import { api } from '@/services/api';
import { useStore } from '@/store/useStore';
import type { Stock, KlineData, TechnicalIndicators } from '@/types';
import { performGannAnalysis } from '@/utils/gannAnalysis';
import clsx from 'clsx';

export default function StockDetailPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [stock, setStock] = useState<Stock | null>(null);
  const [klineData, setKlineData] = useState<KlineData[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'technical' | 'gann' | 'news' | 'ai'>('technical');

  const { isFavorite, addFavorite, removeFavorite, priceUpdates } = useStore();
  const isFav = code ? isFavorite(code) : false;

  useEffect(() => {
    if (code) {
      loadStockData();
    }
  }, [code]);

  const loadStockData = async () => {
    if (!code) return;

    try {
      setLoading(true);
      const [stockData, klineResponse] = await Promise.all([
        api.getStock(code),
        api.getKlineData(code, { count: 200 }),
      ]);

      setStock(stockData);
      setKlineData(klineResponse.kline);
      setIndicators(klineResponse.indicators);
    } catch (error) {
      console.error('Failed to load stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteClick = () => {
    if (!code) return;
    if (isFav) {
      removeFavorite(code);
    } else {
      addFavorite(code);
    }
  };

  if (loading || !stock || !indicators) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <div className="skeleton h-32 glass-white rounded-xl" />
            <div className="skeleton h-96 glass-white rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const priceUpdate = code ? priceUpdates.get(code) : null;
  const displayPrice = priceUpdate?.price || stock.price;
  const displayChange = priceUpdate?.change || stock.change;
  const displayChangePercent = priceUpdate?.changePercent || stock.changePercent;

  const isRise = displayChangePercent > 0;
  const isFall = displayChangePercent < 0;

  // 准备AI分析上下文
  const gannAnalysis = performGannAnalysis(klineData, displayPrice);
  const aiContext = {
    stock,
    klineData,
    indicators,
    gannAnalysis,
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回</span>
        </motion.button>

        {/* Stock Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-white rounded-xl p-6"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-800">{stock.name}</h1>
                <span className="text-xl text-gray-500">{stock.code}</span>
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                  {stock.sector}
                </span>
              </div>
              <div className="flex items-baseline space-x-4">
                <span className="text-5xl font-bold text-gray-900">
                  ${displayPrice.toFixed(2)}
                </span>
                <span
                  className={clsx(
                    'text-2xl font-medium',
                    isRise && 'text-rise',
                    isFall && 'text-fall'
                  )}
                >
                  {displayChange >= 0 ? '+' : ''}
                  {displayChange.toFixed(2)}
                </span>
                <span
                  className={clsx(
                    'flex items-center space-x-1 text-xl font-medium px-4 py-2 rounded-lg',
                    isRise && 'bg-rise text-white',
                    isFall && 'bg-fall text-white',
                    !isRise && !isFall && 'bg-gray-200 text-gray-600'
                  )}
                >
                  {isRise && <TrendingUp className="w-5 h-5" />}
                  {isFall && <TrendingDown className="w-5 h-5" />}
                  <span>
                    {displayChangePercent >= 0 ? '+' : ''}
                    {displayChangePercent.toFixed(2)}%
                  </span>
                </span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFavoriteClick}
              className={clsx(
                'p-4 rounded-xl transition-colors',
                isFav
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'bg-gray-100 text-gray-400'
              )}
            >
              <Star className="w-8 h-8" fill={isFav ? 'currentColor' : 'none'} />
            </motion.button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-600">最高</span>
              </div>
              <span className="text-xl font-bold text-blue-900">
                ${stock.high.toFixed(2)}
              </span>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">最低</span>
              </div>
              <span className="text-xl font-bold text-green-900">
                ${stock.low.toFixed(2)}
              </span>
            </div>

            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-600">成交量</span>
              </div>
              <span className="text-xl font-bold text-orange-900">
                {(stock.volume / 1000000).toFixed(2)}M
              </span>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-600">市值</span>
              </div>
              <span className="text-xl font-bold text-purple-900">
                ${(stock.marketCap / 1000000000).toFixed(2)}B
              </span>
            </div>
          </div>
        </motion.div>

        {/* Analysis Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {[
            { key: 'technical', label: '技术分析' },
            { key: 'gann', label: '江恩理论' },
            { key: 'news', label: '相关资讯' },
            { key: 'ai', label: 'AI助手' },
          ].map((tab) => (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'glass-white text-gray-700 hover:bg-white/80'
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Analysis Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'technical' && (
            <KlineChart data={klineData} indicators={indicators} />
          )}

          {activeTab === 'gann' && (
            <GannChart data={klineData} currentPrice={displayPrice} />
          )}

          {activeTab === 'news' && code && (
            <StockNews stockCode={code} />
          )}

          {activeTab === 'ai' && (
            <AIAssistant context={aiContext} />
          )}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-white rounded-xl p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">基本信息</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">开盘价</div>
              <div className="text-lg font-medium text-gray-800">
                ${stock.open.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">昨收价</div>
              <div className="text-lg font-medium text-gray-800">
                ${stock.prevClose.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">振幅</div>
              <div className="text-lg font-medium text-gray-800">
                {(((stock.high - stock.low) / stock.prevClose) * 100).toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">换手率</div>
              <div className="text-lg font-medium text-gray-800">
                {((stock.volume / (stock.marketCap / stock.price)) * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
