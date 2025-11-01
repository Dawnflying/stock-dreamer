import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import MarketOverview from '@/components/MarketOverview';
import StockList from '@/components/StockList';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'market' | 'favorites'>('market');

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            智能股票分析，助您投资决策
          </h2>
          <p className="text-lg text-white/80">
            实时数据 · 技术指标 · 趋势分析
          </p>
        </motion.div>

        {/* Search Bar */}
        <SearchBar />

        {/* Market Overview */}
        <MarketOverview />

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-white/20">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveTab('market')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'market'
                ? 'text-white border-b-2 border-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            市场行情
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveTab('favorites')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'favorites'
                ? 'text-white border-b-2 border-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            我的自选
          </motion.button>
        </div>

        {/* Stock List */}
        <StockList showFavoritesOnly={activeTab === 'favorites'} />
      </main>
    </div>
  );
}
