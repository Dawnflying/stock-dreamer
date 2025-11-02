import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';

export default function SearchBar() {
  const { searchKeyword, setSearchKeyword } = useStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="搜索股票代码或名称..."
          className="w-full pl-12 pr-4 py-4 rounded-xl glass-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg"
        />
      </div>
    </motion.div>
  );
}
