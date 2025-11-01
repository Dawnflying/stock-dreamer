import { TrendingUp, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="glass-white sticky top-0 z-50 border-b"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg"
            >
              <TrendingUp className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Stock Dreamer
              </h1>
              <p className="text-xs text-gray-500">智能股票分析平台</p>
            </div>
          </Link>

          <nav className="flex items-center space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors"
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">市场</span>
            </Link>
            <Link
              to="/?tab=favorites"
              className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors"
            >
              <Star className="w-5 h-5" />
              <span className="font-medium">自选</span>
            </Link>
          </nav>
        </div>
      </div>
    </motion.header>
  );
}
