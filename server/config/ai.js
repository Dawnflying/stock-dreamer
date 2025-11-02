// AI模型配置
export const aiConfig = {
  // 默认使用的模型提供商: 'openai' | 'anthropic' | 'zhipu' | 'qwen' | 'deepseek'
  provider: process.env.AI_PROVIDER || 'openai',

  // OpenAI配置
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 2000,
  },

  // Anthropic (Claude)配置
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
    model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
    temperature: 0.7,
    maxTokens: 2000,
  },

  // 智谱AI配置
  zhipu: {
    apiKey: process.env.ZHIPU_API_KEY || '',
    baseURL: process.env.ZHIPU_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
    model: process.env.ZHIPU_MODEL || 'glm-4-flash',
    temperature: 0.7,
    maxTokens: 2000,
  },

  // 阿里通义千问配置
  qwen: {
    apiKey: process.env.QWEN_API_KEY || '',
    baseURL: process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: process.env.QWEN_MODEL || 'qwen-turbo',
    temperature: 0.7,
    maxTokens: 2000,
  },

  // DeepSeek配置
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    temperature: 0.7,
    maxTokens: 2000,
  },
};

// 夸克搜索配置
export const quarkSearchConfig = {
  apiKey: process.env.QUARK_API_KEY || '',
  baseURL: process.env.QUARK_BASE_URL || 'https://quark.sm.cn/api/rest',
  // 如果没有夸克API，可以使用备用搜索
  fallbackEnabled: true,
};

// 系统提示词
export const systemPrompts = {
  stockAnalysis: `你是一个专业的股票分析助手，具备以下能力：
1. 精通技术分析：能够解读K线、均线、MACD、RSI、KDJ等技术指标
2. 了解江恩理论：熟悉江恩角度线、方阵、时间周期等分析方法
3. 资讯解读：能够分析财经新闻对股票的影响
4. 风险控制：始终提醒用户注意风险，理性投资

回答要求：
- 专业但易懂，避免过于复杂的术语
- 基于数据和事实，不做过度承诺
- 提供明确的分析逻辑和依据
- 必要时给出风险提示
- 回答简洁，重点突出`,

  webSearch: `你是一个股票信息检索助手，负责：
1. 从搜索结果中提取关键信息
2. 总结股票相关的重要新闻和动态
3. 分析信息对股价可能的影响
4. 过滤无关和低质量信息

回答要求：
- 信息准确，标注来源
- 突出重点，去除冗余
- 客观中立，不做主观判断
- 时效性优先，关注最新动态`,
};
