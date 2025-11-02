import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { stockAPI } from '../services/api';

/**
 * 股票搜索栏组件
 * 支持实时搜索和建议
 */
const SearchBar = ({ onSelectStock }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // 热门股票
  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  ];

  // 点击外部关闭结果
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 搜索股票
  useEffect(() => {
    const searchStocks = async () => {
      if (query.trim().length < 1) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await stockAPI.searchStocks(query);
        setResults(response.results || []);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchStocks, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  // 选择股票
  const handleSelectStock = (stock) => {
    setQuery('');
    setShowResults(false);
    onSelectStock && onSelectStock(stock.symbol);
  };

  // 清空搜索
  const handleClear = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* 搜索输入框 */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="搜索股票代码或公司名称..."
          className="w-full pl-12 pr-12 py-3 bg-white border border-gray-300 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     shadow-sm hover:shadow-md transition-all duration-200
                     text-gray-900 placeholder-gray-400"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-4 hover:opacity-70 transition-opacity"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* 搜索结果下拉框 */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
          >
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="loading-spinner mx-auto" />
                <p className="mt-2 text-sm text-gray-500">搜索中...</p>
              </div>
            ) : query && results.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {results.map((stock, index) => (
                  <motion.div
                    key={stock.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelectStock(stock)}
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0
                               transition-colors duration-150"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{stock.symbol}</p>
                        <p className="text-sm text-gray-500">{stock.name}</p>
                      </div>
                      <TrendingUp className="w-5 h-5 text-primary-500" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : query && !isLoading ? (
              <div className="p-6 text-center text-gray-500">
                <p>未找到相关股票</p>
              </div>
            ) : (
              <div className="p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3 px-2">热门股票</p>
                {popularStocks.map((stock, index) => (
                  <motion.div
                    key={stock.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelectStock(stock)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer rounded-lg
                               transition-colors duration-150"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{stock.symbol}</p>
                        <p className="text-sm text-gray-500">{stock.name}</p>
                      </div>
                      <TrendingUp className="w-4 h-4 text-primary-500" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
