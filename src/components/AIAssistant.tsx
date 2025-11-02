import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Sparkles, Lightbulb, TrendingUp, Shield, DollarSign } from 'lucide-react';
import type { AIAnalysis } from '@/types';
import { generateAIAnswer, type AnalysisContext } from '@/utils/aiAnalysis';

interface AIAssistantProps {
  context: AnalysisContext;
}

const SUGGESTED_QUESTIONS = [
  { icon: TrendingUp, text: '当前趋势如何？', category: 'trend' },
  { icon: Lightbulb, text: '现在适合买入吗？', category: 'trading' },
  { icon: Shield, text: '有哪些支撑位和阻力位？', category: 'levels' },
  { icon: DollarSign, text: '技术指标怎么看？', category: 'indicators' },
];

export default function AIAssistant({ context }: AIAssistantProps) {
  const [question, setQuestion] = useState('');
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = (inputQuestion?: string) => {
    const q = inputQuestion || question;
    if (!q.trim()) return;

    setLoading(true);

    // 模拟AI思考时间
    setTimeout(() => {
      const result = generateAIAnswer(q, context);

      const newAnalysis: AIAnalysis = {
        question: q,
        answer: result.answer,
        confidence: result.confidence,
        relatedFactors: result.relatedFactors,
        timestamp: new Date().toISOString(),
      };

      setAnalyses(prev => [newAnalysis, ...prev]);
      setQuestion('');
      setLoading(false);
    }, 800);
  };

  const handleQuickQuestion = (q: string) => {
    setQuestion(q);
    handleAsk(q);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <span>AI智能分析助手</span>
        </h3>
      </div>

      {/* 输入框 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-white rounded-xl p-4"
      >
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
              placeholder="问我任何关于这只股票的问题..."
              className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
            />
            <MessageCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAsk()}
            disabled={loading || !question.trim()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>思考中</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>提问</span>
              </>
            )}
          </motion.button>
        </div>

        {/* 快捷问题 */}
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((sq, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickQuestion(sq.text)}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm hover:bg-purple-100 transition-colors disabled:opacity-50"
            >
              <sq.icon className="w-4 h-4" />
              <span>{sq.text}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* 分析历史 */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        <AnimatePresence>
          {analyses.map((analysis, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-white rounded-xl p-4 space-y-3"
            >
              {/* 问题 */}
              <div className="flex items-start space-x-3">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{analysis.question}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(analysis.timestamp).toLocaleTimeString('zh-CN')}
                  </p>
                </div>
              </div>

              {/* 回答 */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">AI分析</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                        style={{ width: `${analysis.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">
                      {(analysis.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {analysis.answer}
                </p>

                {/* 关联因子 */}
                {analysis.relatedFactors.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-purple-200">
                    <p className="text-xs text-gray-600 mb-2">关联因子：</p>
                    <div className="flex flex-wrap gap-1">
                      {analysis.relatedFactors.map((factor, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-white text-purple-700 rounded text-xs border border-purple-200"
                        >
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {analyses.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-white rounded-xl p-8 text-center"
          >
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">AI助手已就绪</p>
            <p className="text-sm text-gray-500">
              您可以问我关于技术分析、趋势判断、交易建议等问题
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
