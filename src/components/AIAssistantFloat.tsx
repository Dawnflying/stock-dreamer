import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Sparkles, X, Minimize2, TrendingUp, Lightbulb, Shield, DollarSign, Info, Newspaper } from 'lucide-react';
import type { AIAnalysis } from '@/types';
import { generateAIAnswer, type AnalysisContext } from '@/utils/aiAnalysis';

interface AIAssistantFloatProps {
  context: AnalysisContext;
  currentTab: 'technical' | 'gann' | 'news';
}

const CONTEXT_QUESTIONS = {
  technical: [
    { icon: TrendingUp, text: '当前技术指标怎么看？', category: 'indicators' },
    { icon: Lightbulb, text: 'MACD和RSI显示什么信号？', category: 'indicators' },
    { icon: Shield, text: '现在有哪些支撑位？', category: 'levels' },
    { icon: DollarSign, text: '均线系统如何排列？', category: 'trend' },
  ],
  gann: [
    { icon: Info, text: '江恩方阵价位如何解读？', category: 'gann' },
    { icon: TrendingUp, text: '根据江恩理论该如何操作？', category: 'trading' },
    { icon: Shield, text: '江恩角度线显示什么信号？', category: 'gann' },
    { icon: Lightbulb, text: '当前时间周期处于什么阶段？', category: 'gann' },
  ],
  news: [
    { icon: Newspaper, text: '最新资讯对股价有何影响？', category: 'comprehensive' },
    { icon: TrendingUp, text: '基于资讯和技术面的综合建议？', category: 'trading' },
    { icon: Shield, text: '当前主要风险因素是什么？', category: 'risk' },
    { icon: Lightbulb, text: '市场情绪如何？', category: 'comprehensive' },
  ],
};

export default function AIAssistantFloat({ context, currentTab }: AIAssistantFloatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [question, setQuestion] = useState('');
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([]);
  const [loading, setLoading] = useState(false);

  const contextQuestions = CONTEXT_QUESTIONS[currentTab] || CONTEXT_QUESTIONS.technical;

  const handleAsk = (inputQuestion?: string) => {
    const q = inputQuestion || question;
    if (!q.trim()) return;

    setLoading(true);

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

  const getTabLabel = () => {
    switch (currentTab) {
      case 'technical':
        return '技术分析';
      case 'gann':
        return '江恩理论';
      case 'news':
        return '资讯解读';
      default:
        return 'AI助手';
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-purple-500/50 transition-all"
          >
            <Sparkles className="w-7 h-7" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? 'auto' : '600px',
            }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50 w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-white" />
                <div>
                  <h3 className="text-white font-bold">AI智能助手</h3>
                  <p className="text-white/80 text-xs">{getTabLabel()}模式</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Minimize2 className="w-4 h-4 text-white" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {analyses.length === 0 && !loading && (
                    <div className="text-center py-8">
                      <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-2">AI助手已就绪</p>
                      <p className="text-sm text-gray-500">
                        当前为{getTabLabel()}模式，快速提问：
                      </p>
                    </div>
                  )}

                  {analyses.map((analysis, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      {/* Question */}
                      <div className="flex justify-end">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%]">
                          <p className="text-sm">{analysis.question}</p>
                        </div>
                      </div>

                      {/* Answer */}
                      <div className="flex justify-start">
                        <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm max-w-[85%] shadow-md">
                          <div className="flex items-center space-x-2 mb-2">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            <span className="text-xs font-medium text-purple-700">AI分析</span>
                            <div className="flex items-center space-x-1 ml-auto">
                              <div className="w-12 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-1.5 rounded-full"
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
                          {analysis.relatedFactors.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <div className="flex flex-wrap gap-1">
                                {analysis.relatedFactors.map((factor, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs"
                                  >
                                    {factor}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-md">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Quick Questions */}
                <div className="p-3 bg-white border-t border-gray-200">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {contextQuestions.map((sq, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleQuickQuestion(sq.text)}
                        disabled={loading}
                        className="flex items-center space-x-1 px-2 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs hover:bg-purple-100 transition-colors disabled:opacity-50"
                      >
                        <sq.icon className="w-3 h-3" />
                        <span className="line-clamp-1">{sq.text}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
                      placeholder={`问我关于${getTabLabel()}的问题...`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      disabled={loading}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAsk()}
                      disabled={loading || !question.trim()}
                      className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
