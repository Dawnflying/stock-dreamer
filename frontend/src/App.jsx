import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Star, RefreshCw, TrendingUp } from 'lucide-react';
import SearchBar from './components/SearchBar';
import StockCard from './components/StockCard';
import StockChart from './components/StockChart';
import { stockAPI } from './services/api';

/**
 * 主应用组件
 */
function App() {
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockInfo, setStockInfo] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [indicators, setIndicators] = useState({});
  const [watchlist, setWatchlist] = useState(['AAPL', 'GOOGL', 'MSFT', 'TSLA']);
  const [watchlistData, setWatchlistData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('1mo');
  const [chartType, setChartType] = useState('area');

  // 加载自选股数据
  useEffect(() => {
    loadWatchlist();
  }, [watchlist]);

  // 加载选中股票的详细数据
  useEffect(() => {
    if (selectedStock) {
      loadStockDetails(selectedStock);
    }
  }, [selectedStock, period]);

  // 加载自选股列表
  const loadWatchlist = async () => {
    try {
      const data = await stockAPI.getMultipleStocks(watchlist);
      setWatchlistData(data.stocks || []);
    } catch (error) {
      console.error('Error loading watchlist:', error);
    }
  };

  // 加载股票详细信息
  const loadStockDetails = async (symbol) => {
    setLoading(true);
    try {
      // 并行请求股票信息、历史数据和技术分析
      const [info, history, analysis] = await Promise.all([
        stockAPI.getStockInfo(symbol),
        stockAPI.getStockHistory(symbol, period, '1d'),
        stockAPI.getStockAnalysis(symbol, period),
      ]);

      setStockInfo(info);
      setHistoricalData(history.data || []);
      setIndicators(analysis.indicators || {});
    } catch (error) {
      console.error('Error loading stock details:', error);
      setStockInfo(null);
      setHistoricalData([]);
      setIndicators({});
    } finally {
      setLoading(false);
    }
  };

  // 选择股票
  const handleSelectStock = (symbol) => {
    setSelectedStock(symbol);
  };

  // 添加到自选股
  const addToWatchlist = (symbol) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
    }
  };

  // 从自选股移除
  const removeFromWatchlist = (symbol) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
  };

  // 刷新数据
  const handleRefresh = () => {
    if (selectedStock) {
      loadStockDetails(selectedStock);
    }
    loadWatchlist();
  };

  // 时间周期选项
  const periodOptions = [
    { value: '1d', label: '1天' },
    { value: '5d', label: '5天' },
    { value: '1mo', label: '1月' },
    { value: '3mo', label: '3月' },
    { value: '6mo', label: '6月' },
    { value: '1y', label: '1年' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm sticky top-0 z-40 backdrop-blur-sm bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="bg-gradient-to-r from-primary-500 to-purple-500 p-2 rounded-xl">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                  Stock Dreamer
                </h1>
                <p className="text-sm text-gray-500">智能股票分析平台</p>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索栏 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <SearchBar onSelectStock={handleSelectStock} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：自选股列表 */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 sticky top-24"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500 fill-yellow-500" />
                  自选股
                </h2>
                <span className="text-sm text-gray-500">{watchlist.length}</span>
              </div>

              <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                <AnimatePresence>
                  {watchlistData.map((stock, index) => (
                    <motion.div
                      key={stock.symbol}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSelectStock(stock.symbol)}
                      className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedStock === stock.symbol
                          ? 'bg-primary-50 ring-2 ring-primary-500'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{stock.symbol}</p>
                          <p className="text-sm text-gray-500 truncate max-w-[120px]">
                            {stock.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ${stock.currentPrice?.toFixed(2)}
                          </p>
                          <p
                            className={`text-sm font-medium ${
                              stock.change > 0
                                ? 'text-success'
                                : stock.change < 0
                                ? 'text-danger'
                                : 'text-gray-500'
                            }`}
                          >
                            {stock.change > 0 && '+'}
                            {stock.changePercent?.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* 右侧：详细信息 */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-96"
              >
                <div className="text-center">
                  <div className="loading-spinner mx-auto mb-4" />
                  <p className="text-gray-500">加载中...</p>
                </div>
              </motion.div>
            ) : selectedStock && stockInfo ? (
              <>
                {/* 股票卡片 */}
                <StockCard stock={stockInfo} selected={true} />

                {/* 时间周期选择器 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 bg-white rounded-xl shadow-lg p-4"
                >
                  <span className="text-sm font-medium text-gray-700 mr-2">时间周期:</span>
                  {periodOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPeriod(option.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        period === option.value
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>

                {/* 股票图表 */}
                {historicalData.length > 0 && (
                  <StockChart
                    data={historicalData}
                    type={chartType}
                    indicators={indicators}
                  />
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-96 bg-white rounded-xl shadow-lg"
              >
                <TrendingUp className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-xl text-gray-500 mb-2">选择一只股票开始分析</p>
                <p className="text-sm text-gray-400">使用搜索栏或从自选股列表中选择</p>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white mt-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2025 Stock Dreamer. 智能股票分析平台</p>
            <p className="mt-2">数据仅供参考，投资有风险，入市需谨慎</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
