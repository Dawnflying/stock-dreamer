import axios from 'axios';
import { aiConfig, systemPrompts } from '../config/ai.js';

class AIService {
  constructor() {
    this.provider = aiConfig.provider;
    this.config = aiConfig[this.provider];
  }

  /**
   * 调用AI模型生成回答
   * @param {string} userMessage - 用户消息
   * @param {object} context - 股票上下文信息
   * @param {string} mode - 模式: 'analysis' | 'search'
   * @returns {Promise<object>} - AI响应
   */
  async chat(userMessage, context = {}, mode = 'analysis') {
    try {
      const systemPrompt = mode === 'search'
        ? systemPrompts.webSearch
        : systemPrompts.stockAnalysis;

      const contextMessage = this.buildContextMessage(context);

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'system', content: contextMessage },
        { role: 'user', content: userMessage },
      ];

      let response;

      switch (this.provider) {
        case 'openai':
        case 'deepseek':
        case 'qwen':
          response = await this.callOpenAICompatible(messages);
          break;
        case 'anthropic':
          response = await this.callAnthropic(messages);
          break;
        case 'zhipu':
          response = await this.callZhipu(messages);
          break;
        default:
          throw new Error(`Unsupported AI provider: ${this.provider}`);
      }

      return {
        success: true,
        answer: response.content,
        provider: this.provider,
        model: this.config.model,
      };
    } catch (error) {
      console.error('AI Service Error:', error);

      // 如果API调用失败，返回本地分析结果
      return {
        success: false,
        answer: this.getFallbackAnswer(userMessage, context),
        provider: 'fallback',
        error: error.message,
      };
    }
  }

  /**
   * 构建上下文消息
   */
  buildContextMessage(context) {
    if (!context.stock) {
      return '当前没有股票上下文信息。';
    }

    const { stock, indicators, gannAnalysis } = context;

    let message = `当前分析的股票信息：\n`;
    message += `股票名称：${stock.name} (${stock.code})\n`;
    message += `当前价格：$${stock.price.toFixed(2)}\n`;
    message += `涨跌幅：${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%\n`;
    message += `成交量：${(stock.volume / 1000000).toFixed(2)}M\n`;
    message += `市值：$${(stock.marketCap / 1000000000).toFixed(2)}B\n`;

    if (indicators) {
      const rsi = indicators.rsi[indicators.rsi.length - 1];
      const macd = indicators.macd.macd[indicators.macd.macd.length - 1];
      message += `\n技术指标：\n`;
      if (rsi) message += `RSI: ${rsi.toFixed(2)}\n`;
      if (macd) message += `MACD: ${macd.toFixed(2)}\n`;
    }

    if (gannAnalysis?.predictions) {
      const supports = gannAnalysis.predictions
        .filter(p => p.type === 'support')
        .slice(0, 2);
      const resistances = gannAnalysis.predictions
        .filter(p => p.type === 'resistance')
        .slice(0, 2);

      if (supports.length > 0 || resistances.length > 0) {
        message += `\n江恩分析：\n`;
        if (supports.length > 0) {
          message += `主要支撑位：${supports.map(s => `$${s.level.toFixed(2)}`).join(', ')}\n`;
        }
        if (resistances.length > 0) {
          message += `主要阻力位：${resistances.map(r => `$${r.level.toFixed(2)}`).join(', ')}\n`;
        }
      }
    }

    return message;
  }

  /**
   * 调用OpenAI兼容接口
   */
  async callOpenAICompatible(messages) {
    const response = await axios.post(
      `${this.config.baseURL}/chat/completions`,
      {
        model: this.config.model,
        messages: messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        timeout: 30000,
      }
    );

    return {
      content: response.data.choices[0].message.content,
      usage: response.data.usage,
    };
  }

  /**
   * 调用Anthropic Claude
   */
  async callAnthropic(messages) {
    // 分离system消息和其他消息
    const systemMessages = messages.filter(m => m.role === 'system');
    const otherMessages = messages.filter(m => m.role !== 'system');
    const systemContent = systemMessages.map(m => m.content).join('\n\n');

    const response = await axios.post(
      `${this.config.baseURL}/v1/messages`,
      {
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        system: systemContent,
        messages: otherMessages,
        temperature: this.config.temperature,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        timeout: 30000,
      }
    );

    return {
      content: response.data.content[0].text,
      usage: response.data.usage,
    };
  }

  /**
   * 调用智谱AI
   */
  async callZhipu(messages) {
    const response = await axios.post(
      `${this.config.baseURL}/chat/completions`,
      {
        model: this.config.model,
        messages: messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        timeout: 30000,
      }
    );

    return {
      content: response.data.choices[0].message.content,
      usage: response.data.usage,
    };
  }

  /**
   * 降级方案：使用本地规则生成回答
   */
  getFallbackAnswer(question, context) {
    const q = question.toLowerCase();

    if (!context.stock) {
      return '抱歉，当前AI服务暂时不可用。请稍后再试或检查API配置。';
    }

    const { stock, indicators } = context;
    const rsi = indicators?.rsi?.[indicators.rsi.length - 1];
    const changePercent = stock.changePercent;

    let answer = `基于本地分析（AI服务暂时不可用）：\n\n`;

    if (q.includes('趋势') || q.includes('走势')) {
      answer += `${stock.name}当前价格为$${stock.price.toFixed(2)}，`;
      answer += changePercent > 0 ? '呈上涨趋势。' : changePercent < 0 ? '呈下跌趋势。' : '价格持平。';
    } else if (q.includes('指标')) {
      if (rsi) {
        answer += `RSI指标为${rsi.toFixed(2)}`;
        if (rsi > 70) answer += '，处于超买区域，注意回调风险。';
        else if (rsi < 30) answer += '，处于超卖区域，可能出现反弹。';
        else answer += '，处于中性区域。';
      }
    } else {
      answer += `${stock.name}当前价格$${stock.price.toFixed(2)}，涨跌幅${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%。\n\n`;
      answer += '建议关注技术指标和市场动态，理性投资，控制风险。';
    }

    answer += '\n\n提示：完整的AI分析需要配置有效的API密钥。';

    return answer;
  }
}

export default new AIService();
