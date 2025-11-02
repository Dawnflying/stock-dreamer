import axios from 'axios';
import { quarkSearchConfig } from '../config/ai.js';

class SearchService {
  constructor() {
    this.config = quarkSearchConfig;
  }

  /**
   * 搜索股票相关信息
   * @param {string} stockName - 股票名称
   * @param {string} stockCode - 股票代码
   * @param {string} query - 额外查询关键词
   * @returns {Promise<array>} - 搜索结果
   */
  async searchStockInfo(stockName, stockCode, query = '') {
    try {
      // 构建搜索查询
      const searchQuery = `${stockName} ${stockCode} ${query} 股票 财经`.trim();

      let results = [];

      // 尝试使用夸克搜索
      if (this.config.apiKey) {
        try {
          results = await this.searchWithQuark(searchQuery);
        } catch (error) {
          console.error('Quark search failed:', error.message);
          if (this.config.fallbackEnabled) {
            results = await this.searchWithFallback(searchQuery);
          }
        }
      } else if (this.config.fallbackEnabled) {
        // 使用备用搜索
        results = await this.searchWithFallback(searchQuery);
      } else {
        throw new Error('No search API configured');
      }

      return {
        success: true,
        query: searchQuery,
        results: results,
        source: this.config.apiKey ? 'quark' : 'fallback',
      };
    } catch (error) {
      console.error('Search Service Error:', error);
      return {
        success: false,
        query: '',
        results: [],
        error: error.message,
      };
    }
  }

  /**
   * 使用夸克搜索API
   */
  async searchWithQuark(query) {
    try {
      const response = await axios.get(`${this.config.baseURL}/search`, {
        params: {
          q: query,
          count: 10,
        },
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      if (response.data && response.data.results) {
        return response.data.results.map(item => ({
          title: item.title || '',
          snippet: item.snippet || item.description || '',
          url: item.url || '',
          source: item.source || '夸克搜索',
          publishTime: item.publishTime || new Date().toISOString(),
        }));
      }

      return [];
    } catch (error) {
      throw new Error(`Quark API error: ${error.message}`);
    }
  }

  /**
   * 备用搜索方案：使用模拟数据或其他免费API
   */
  async searchWithFallback(query) {
    // 这里可以集成其他免费搜索API，如：
    // - DuckDuckGo API
    // - Bing Search API（有免费额度）
    // - Google Custom Search（有免费额度）
    // 或者返回模拟数据

    // 为了演示，这里返回基于查询的模拟结果
    const results = this.generateMockResults(query);

    // 如果要使用真实的备用API，可以这样：
    // try {
    //   const response = await axios.get('https://api.duckduckgo.com/', {
    //     params: { q: query, format: 'json' }
    //   });
    //   return this.parseDuckDuckGoResults(response.data);
    // } catch (error) {
    //   return this.generateMockResults(query);
    // }

    return results;
  }

  /**
   * 生成模拟搜索结果（用于演示）
   */
  generateMockResults(query) {
    const keywords = query.split(' ').filter(k => k.length > 0);
    const stockKeyword = keywords[0] || '该股票';

    const mockResults = [
      {
        title: `${stockKeyword}最新财报解读：业绩超预期`,
        snippet: `${stockKeyword}发布最新季度财报，营收同比增长15%，净利润增长20%，超出市场预期。分析师普遍看好公司未来发展前景...`,
        url: `https://example.com/news/1`,
        source: '财经新闻网',
        publishTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: `机构调研：${stockKeyword}核心竞争力分析`,
        snippet: `多家机构近期密集调研${stockKeyword}，重点关注其技术创新能力和市场份额提升。公司在行业中的地位持续巩固...`,
        url: `https://example.com/news/2`,
        source: '投资者报',
        publishTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: `${stockKeyword}技术面分析：多空博弈激烈`,
        snippet: `从技术面看，${stockKeyword}目前处于关键支撑位附近，成交量有所放大。短期走势取决于能否突破重要阻力位...`,
        url: `https://example.com/news/3`,
        source: '股市分析',
        publishTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: `行业动态：${stockKeyword}所在板块整体向好`,
        snippet: `受益于行业政策利好和市场需求增长，${stockKeyword}所在板块表现强劲。行业龙头企业集体上涨，市场情绪乐观...`,
        url: `https://example.com/news/4`,
        source: '行业观察',
        publishTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: `分析师观点：${stockKeyword}投资价值评估`,
        snippet: `多位分析师给出${stockKeyword}的目标价区间，综合考虑基本面和估值水平，认为当前价位具有一定投资价值...`,
        url: `https://example.com/news/5`,
        source: '证券研究',
        publishTime: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return mockResults;
  }

  /**
   * 提取搜索结果的关键信息
   */
  extractKeyInfo(results) {
    if (!results || results.length === 0) {
      return '未找到相关信息。';
    }

    let summary = '搜索到以下关键信息：\n\n';

    results.slice(0, 5).forEach((result, index) => {
      summary += `${index + 1}. ${result.title}\n`;
      summary += `   ${result.snippet}\n`;
      summary += `   来源：${result.source}\n\n`;
    });

    return summary;
  }
}

export default new SearchService();
