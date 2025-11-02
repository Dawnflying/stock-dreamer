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
import AIAssistantFloat from '@/components/AIAssistantFloat';
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
  const [activeTab, setActiveTab] = useState<'technical' | 'gann' | 'news'>('technical');

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
    <div className="min-h-screen pb-20">
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

        {/* Stock Header - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-transparent rounded-2xl" />

          <div className="relative glass-white rounded-2xl p-8 border border-white/20">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {stock.name}
                  </h1>
                  <span className="text-2xl text-gray-500">{stock.code}</span>
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold shadow-lg"
                  >
                    {stock.sector}
                  </motion.span>
                </div>
                <div className="flex items-baseline space-x-4">
                  <span className="text-6xl font-bold text-gray-900">
                    ${displayPrice.toFixed(2)}
                  </span>
                  <motion.span
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className={clsx(
                      'text-3xl font-bold',
                      isRise && 'text-rise',
                      isFall && 'text-fall'
                    )}
                  >
                    {displayChange >= 0 ? '+' : ''}
                    {displayChange.toFixed(2)}
                  </motion.span>
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className={clsx(
                      'flex items-center space-x-2 text-2xl font-bold px-6 py-3 rounded-xl shadow-lg',
                      isRise && 'bg-gradient-to-r from-red-500 to-red-600 text-white',
                      isFall && 'bg-gradient-to-r from-green-500 to-green-600 text-white',
                      !isRise && !isFall && 'bg-gray-200 text-gray-600'
                    )}
                  >
                    {isRise && <TrendingUp className="w-6 h-6" />}
                    {isFall && <TrendingDown className="w-6 h-6" />}
                    <span>
                      {displayChangePercent >= 0 ? '+' : ''}
                      {displayChangePercent.toFixed(2)}%
                    </span>
                  </motion.span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleFavoriteClick}
                className={clsx(
                  'p-5 rounded-2xl transition-all shadow-lg',
                  isFav
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white'
                    : 'bg-white text-gray-400 hover:bg-gray-50'
                )}
              >
                <Star className="w-10 h-10" fill={isFav ? 'currentColor' : 'none'} strokeWidth={2} />
              </motion.button>
            </div>

            {/* Stats Grid - Enhanced */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                whileHover={{ y: -4 }}
                className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-blue-700">最高</span>
                </div>
                <span className="text-2xl font-bold text-blue-900">
                  ${stock.high.toFixed(2)}
                </span>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-green-700">最低</span>
                </div>
                <span className="text-2xl font-bold text-green-900">
                  ${stock.low.toFixed(2)}
                </span>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-orange-700">成交量</span>
                </div>
                <span className="text-2xl font-bold text-orange-900">
                  {(stock.volume / 1000000).toFixed(2)}M
                </span>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-purple-700">市值</span>
                </div>
                <span className="text-2xl font-bold text-purple-900">
                  ${(stock.marketCap / 1000000000).toFixed(2)}B
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Analysis Tabs - Enhanced */}
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {[
            { key: 'technical', label: '📊 技术分析', description: '指标与趋势' },
            { key: 'gann', label: '🔮 江恩理论', description: '角度与周期' },
            { key: 'news', label: '📰 资讯时间线', description: '动态追踪' },
          ].map((tab) => (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-8 py-4 rounded-2xl font-bold whitespace-nowrap transition-all flex flex-col items-start min-w-[140px] ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/50'
                  : 'glass-white text-gray-700 hover:bg-white/80 hover:shadow-lg'
              }`}
            >
              <span className="text-lg mb-1">{tab.label}</span>
              <span className={`text-xs ${activeTab === tab.key ? 'text-white/80' : 'text-gray-500'}`}>
                {tab.description}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Analysis Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          {activeTab === 'technical' && (
            <div className="space-y-6">
              <KlineChart data={klineData} indicators={indicators} />
            </div>
          )}

          {activeTab === 'gann' && (
            <div className="space-y-6">
              <GannChart data={klineData} currentPrice={displayPrice} />
            </div>
          )}

          {activeTab === 'news' && code && (
            <div className="space-y-6">
              <StockNews stockCode={code} />
            </div>
          )}
        </motion.div>

        {/* Additional Info - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-white rounded-2xl p-6 border border-white/20"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full" />
            <span>基本信息</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
              <div className="text-sm text-gray-500 mb-1">开盘价</div>
              <div className="text-xl font-bold text-gray-800">
                ${stock.open.toFixed(2)}
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
              <div className="text-sm text-gray-500 mb-1">昨收价</div>
              <div className="text-xl font-bold text-gray-800">
                ${stock.prevClose.toFixed(2)}
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
              <div className="text-sm text-gray-500 mb-1">振幅</div>
              <div className="text-xl font-bold text-gray-800">
                {(((stock.high - stock.low) / stock.prevClose) * 100).toFixed(2)}%
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
              <div className="text-sm text-gray-500 mb-1">换手率</div>
              <div className="text-xl font-bold text-gray-800">
                {((stock.volume / (stock.marketCap / stock.price)) * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* AI Assistant Float */}
      <AIAssistantFloat context={aiContext} currentTab={activeTab} />
    </div>
  );
}
