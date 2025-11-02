// 模拟股票新闻数据
export const newsDatabase = {
  AAPL: [
    {
      id: 'news_aapl_1',
      title: '苹果发布新一代iPhone，预订量创历史新高',
      summary: '苹果公司今日发布最新iPhone系列产品，首日预订量突破历史记录，市场反应热烈，分析师预计将显著提升本季度营收。',
      source: '科技日报',
      publishTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      sentiment: 'positive',
      tags: ['产品发布', '营收增长', '市场反应'],
    },
    {
      id: 'news_aapl_2',
      title: '苹果供应链管理获业界认可，供应商满意度提升',
      summary: '最新调查显示，苹果在供应链管理方面表现出色，供应商满意度较去年提升15%，有助于保障产品稳定供应。',
      source: '财经新闻网',
      publishTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      sentiment: 'positive',
      tags: ['供应链', '合作伙伴'],
    },
    {
      id: 'news_aapl_3',
      title: '分析师上调苹果目标价，看好服务业务增长',
      summary: '多家投行分析师上调苹果目标价，认为其服务业务持续增长将成为新的利润增长点，预计未来三年复合增长率超20%。',
      source: '投资者报',
      publishTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      sentiment: 'positive',
      tags: ['分析师评级', '服务业务', '增长预期'],
    },
  ],
  TSLA: [
    {
      id: 'news_tsla_1',
      title: '特斯拉上海工厂产能提升，月产量突破8万辆',
      summary: '特斯拉上海超级工厂持续扩产，最新数据显示月产量已突破8万辆，创历史新高，有力支持全球市场需求。',
      source: '汽车周刊',
      publishTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      sentiment: 'positive',
      tags: ['产能提升', '中国市场', '生产数据'],
    },
    {
      id: 'news_tsla_2',
      title: '特斯拉面临召回压力，安全问题引发关注',
      summary: '美国监管机构要求特斯拉就部分车型的安全问题进行说明，可能面临大规模召回，市场担忧情绪升温。',
      source: '安全监察报',
      publishTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      sentiment: 'negative',
      tags: ['产品召回', '安全问题', '监管压力'],
    },
    {
      id: 'news_tsla_3',
      title: '马斯克宣布新电池技术突破，成本将降低50%',
      summary: '特斯拉CEO马斯克在电池日活动上宣布新一代电池技术取得重大突破，预计将使电动车成本下降50%，大幅提升市场竞争力。',
      source: '新能源观察',
      publishTime: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      sentiment: 'positive',
      tags: ['技术创新', '电池技术', '成本优化'],
    },
  ],
  // 为其他股票生成通用新闻
  DEFAULT: [
    {
      id: 'news_default_1',
      title: '公司发布季度财报，业绩超预期',
      summary: '公司最新发布的季度财报显示，营收和利润均超出市场预期，管理层对未来发展前景保持乐观态度。',
      source: '财经快讯',
      publishTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      sentiment: 'positive',
      tags: ['财报发布', '业绩超预期'],
    },
    {
      id: 'news_default_2',
      title: '行业竞争加剧，市场份额面临挑战',
      summary: '随着新竞争对手进入市场，行业竞争日益激烈，公司需要加大研发投入以保持市场地位。',
      source: '行业分析',
      publishTime: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      sentiment: 'neutral',
      tags: ['市场竞争', '行业动态'],
    },
    {
      id: 'news_default_3',
      title: '公司宣布战略投资，拓展新业务领域',
      summary: '公司今日宣布完成对某科技公司的战略投资，将进入新的业务领域，有望开辟新的增长点。',
      source: '投资界',
      publishTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      sentiment: 'positive',
      tags: ['战略投资', '业务拓展'],
    },
  ],
};

export function getStockNews(stockCode) {
  // 如果有特定股票的新闻，返回特定新闻，否则返回默认新闻
  if (newsDatabase[stockCode]) {
    return newsDatabase[stockCode].map(news => ({
      ...news,
      id: `${news.id}_${Date.now()}`,
    }));
  }

  // 返回默认新闻，但自定义股票代码
  return newsDatabase.DEFAULT.map((news, index) => ({
    ...news,
    id: `news_${stockCode}_${index}_${Date.now()}`,
  }));
}
