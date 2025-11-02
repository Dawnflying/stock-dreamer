# Stock Dreamer 📈

一个现代化、动感十足的智能股票分析平台，提供实时数据、技术指标分析和优雅的用户交互体验。

## ✨ 特性

### 🎯 核心功能

- **实时股票数据** - WebSocket实时推送价格更新
- **智能搜索** - 快速搜索股票代码和名称
- **自选股管理** - 添加和管理您关注的股票
- **市场概览** - 一览市场整体走势和热点股票
- **多维排序** - 按涨跌幅、成交量等多种方式排序

### 📊 技术分析

- **K线图表** - 专业的蜡烛图展示，支持缩放和拖拽
- **移动平均线 (MA)** - MA5、MA10、MA20、MA30
- **MACD指标** - DIF、DEA、MACD柱状图
- **RSI指标** - 相对强弱指数，超买超卖提示
- **KDJ指标** - 随机指标K、D、J线

### 🔮 江恩理论分析

- **江恩角度线** - 1x1、1x2、2x1等关键角度线
- **江恩方阵** - 基于完全平方数的价格方阵
- **时间周期** - 7、30、60、90、120、144、180天重要周期
- **支撑阻力预测** - 基于江恩理论的智能价位预测
- **可视化展示** - 直观展示江恩分析结果

### 📰 资讯与信息

- **实时资讯** - 股票相关新闻和公告
- **情绪分析** - 利好/利空/中性情绪标记
- **智能过滤** - 按情绪类型筛选资讯
- **来源追溯** - 显示新闻来源和发布时间
- **标签分类** - 资讯主题标签快速识别

### 🤖 AI智能助手

- **真实LLM对话** - 支持OpenAI、Claude、智谱、通义千问、DeepSeek等多种AI模型
- **智能问答** - 基于当前股票数据的智能分析
- **网络搜索** - 通过夸克搜索API获取最新股票资讯
- **多维度分析** - 趋势、技术指标、江恩理论综合分析
- **交易建议** - 基于多因子模型的操作建议
- **风险评估** - 波动率分析和风险等级评估
- **快捷提问** - 预设常见问题快速获取答案
- **上下文感知** - 根据当前所在板块（技术/江恩/资讯）动态切换分析重点
- **置信度显示** - 分析结果可信度评分
- **关联因子** - 展示影响分析结果的关键因素
- **悬浮球设计** - 右下角智能助手悬浮球，随时唤起对话

### 🎨 动感交互

- **流畅动画** - Framer Motion驱动的丝滑过渡效果
- **响应式设计** - 完美适配各种屏幕尺寸
- **玻璃态UI** - 现代化的毛玻璃效果
- **悬停反馈** - 卡片悬停放大、按钮交互动画
- **渐变背景** - 精美的渐变色彩方案

## 🚀 快速开始

### 环境要求

- Node.js >= 16.x
- npm >= 8.x

### 安装依赖

```bash
npm install
```

### 启动应用

```bash
npm run dev
```

这将同时启动：
- 前端开发服务器：http://localhost:3000
- 后端API服务器：http://localhost:3001

### 单独启动

```bash
# 仅启动前端
npx vite

# 仅启动后端
npm run server
```

### 生产构建

```bash
npm run build
npm run preview
```

## 🔑 AI助手配置

### 配置AI模型

AI智能助手支持多种大语言模型，您可以选择任意一个进行配置：

1. **编辑 `.env` 文件**

项目根目录已包含 `.env` 文件模板，填入您的API密钥即可：

```bash
# 选择使用的AI提供商
AI_PROVIDER=openai  # 可选：openai | anthropic | zhipu | qwen | deepseek

# 填入对应提供商的API密钥
OPENAI_API_KEY=your_api_key_here
# 或
ANTHROPIC_API_KEY=your_api_key_here
# 或
ZHIPU_API_KEY=your_api_key_here
# ... 等等
```

2. **支持的AI提供商**

| 提供商 | 模型 | 获取API Key |
|--------|------|-------------|
| OpenAI | gpt-4o-mini | https://platform.openai.com |
| Anthropic | claude-3-5-sonnet | https://console.anthropic.com |
| 智谱AI | glm-4-flash | https://open.bigmodel.cn |
| 阿里通义千问 | qwen-turbo | https://dashscope.aliyuncs.com |
| DeepSeek | deepseek-chat | https://platform.deepseek.com |

3. **配置网络搜索（可选）**

如果需要使用网络搜索功能获取最新股票资讯：

```bash
QUARK_API_KEY=your_quark_api_key_here
```

**注意：** 如果未配置API密钥，AI助手将自动降级到本地分析模式，仍可提供基本的技术分析和建议。

### AI助手使用指南

1. **打开AI助手**：点击右下角紫色悬浮球
2. **选择模式**：
   - 默认：根据当前板块智能问答（技术分析/江恩理论/资讯解读）
   - 网络搜索：点击"切换搜索"按钮，搜索最新股票相关资讯
3. **快捷提问**：点击预设问题快速获取分析
4. **自定义提问**：在输入框输入问题，按Enter或点击发送

## 📁 项目结构

```
stock-dreamer/
├── src/                      # 前端源代码
│   ├── components/          # React组件
│   │   ├── Header.tsx       # 头部导航
│   │   ├── SearchBar.tsx    # 搜索栏
│   │   ├── StockCard.tsx    # 股票卡片
│   │   ├── StockList.tsx    # 股票列表
│   │   ├── MarketOverview.tsx # 市场概览
│   │   └── KlineChart.tsx   # K线图表
│   ├── pages/               # 页面组件
│   │   ├── HomePage.tsx     # 首页
│   │   └── StockDetailPage.tsx # 股票详情页
│   ├── services/            # API服务
│   │   └── api.ts           # HTTP和WebSocket服务
│   ├── store/               # 状态管理
│   │   └── useStore.ts      # Zustand store
│   ├── types/               # TypeScript类型
│   │   └── index.ts         # 类型定义
│   ├── App.tsx              # 应用根组件
│   ├── main.tsx             # 应用入口
│   └── index.css            # 全局样式
├── server/                   # 后端服务
│   ├── config/              # 配置文件
│   │   └── ai.js            # AI模型配置
│   ├── services/            # 服务层
│   │   ├── aiService.js     # AI服务（支持多种LLM）
│   │   └── searchService.js # 搜索服务（夸克搜索）
│   ├── data/                # 数据文件
│   │   ├── stocks.js        # 股票数据
│   │   └── news.js          # 新闻数据
│   ├── utils/               # 工具函数
│   │   └── mockData.js      # 数据生成工具
│   └── index.js             # Express服务器
├── .env                     # 环境变量配置
├── .env.example             # 环境变量模板
├── index.html               # HTML入口
├── package.json             # 项目配置
├── vite.config.ts           # Vite配置
├── tailwind.config.js       # TailwindCSS配置
└── tsconfig.json            # TypeScript配置
```

## 🛠 技术栈

### 前端

- **React 18** - 用户界面框架
- **TypeScript** - 类型安全
- **Vite** - 快速构建工具
- **React Router** - 路由管理
- **Zustand** - 轻量级状态管理
- **Framer Motion** - 动画库
- **ECharts** - 数据可视化
- **TailwindCSS** - 原子化CSS框架
- **Axios** - HTTP客户端
- **Lucide React** - 图标库

### 后端

- **Node.js** - 运行时环境
- **Express** - Web框架
- **WebSocket (ws)** - 实时通信
- **CORS** - 跨域支持

## 🎯 功能详解

### 1. 实时数据更新

应用通过WebSocket连接实时接收股票价格更新，每2秒推送一次最新数据，无需手动刷新。

### 2. 股票搜索

支持按股票代码（如 AAPL）或公司名称（如 苹果）进行实时搜索过滤。

### 3. 自选股管理

- 点击星标按钮添加/移除自选股
- 自选股数据保存在本地存储
- 独立的自选股列表视图

### 4. 市场概览

实时展示：
- 总股票数量
- 上涨/下跌/平盘股票数量和比例
- 涨幅榜、跌幅榜、成交量榜

### 5. K线图表分析

**主图功能：**
- 蜡烛图显示开高低收
- 成交量柱状图
- 可选择MA均线叠加显示
- 支持鼠标缩放和拖拽
- 数据区间滑块

**副图指标：**
- **MACD** - 趋势跟踪指标
- **RSI** - 超买超卖指标（含70/30警戒线）
- **KDJ** - 随机震荡指标

### 6. 股票详情页

点击任意股票卡片进入详情页，包含四大分析板块：

**技术分析板块：**
- 实时价格和涨跌幅
- 当日最高/最低/开盘价
- 成交量和市值
- 完整的K线图表和技术指标
- 基本面数据（开盘价、昨收价、振幅、换手率等）

**江恩理论板块：**
- 江恩角度线叠加在K线图上
- 江恩方阵价格位可视化
- 支撑位/阻力位智能预测
- 重要时间周期标注
- 方阵中心价位分析

**相关资讯板块：**
- 最新股票相关新闻列表
- 利好/利空/中性情绪标签
- 按情绪类型筛选功能
- 新闻来源和发布时间
- 主题标签分类

**AI助手板块：**
- 智能问答交互界面
- 快捷问题模板
- 基于技术指标和江恩理论的综合分析
- 置信度评分系统
- 关联因子展示

## 🎨 设计特色

### 视觉设计

- **渐变背景** - 紫色到粉色的优雅渐变
- **玻璃态卡片** - 毛玻璃效果配合阴影
- **色彩系统** - 红涨绿跌的中国市场习惯
- **圆角设计** - 柔和的圆角元素

### 交互动画

- **页面进入** - 淡入和上滑动画
- **卡片悬停** - 轻微上浮和阴影增强
- **按钮反馈** - 缩放和颜色过渡
- **图表加载** - 平滑的数据渲染动画

### 用户体验

- **加载状态** - 优雅的骨架屏
- **空状态** - 友好的提示信息
- **实时更新** - 价格数据平滑过渡
- **快捷操作** - 一键添加自选、快速搜索

## 📊 API接口

### REST API

```
GET /api/stocks              # 获取股票列表
  - keyword: 搜索关键词
  - sort: 排序方式 (change/volume)

GET /api/stocks/:code        # 获取单只股票详情

GET /api/kline/:code         # 获取K线数据
  - period: 周期 (day/week/month)
  - count: 数据条数

GET /api/market/overview     # 获取市场概况

GET /api/news/:code          # 获取股票新闻
  返回：新闻列表（含情绪分析和标签）

POST /api/ai/chat            # AI智能问答
  Body: { message: string, context: object }
  返回：{ answer: string, provider: string, model: string, success: boolean }

POST /api/search/stock       # 股票网络搜索
  Body: { stockName: string, stockCode: string, query?: string }
  返回：{ query: string, results: array, summary: object, source: string }
```

### WebSocket

```
ws://localhost:3001

事件类型：
- price_update: 实时价格更新
  数据格式：{ type: 'price_update', data: Array<PriceUpdate> }
```

## 🔧 配置说明

### 修改端口

在 `vite.config.ts` 中修改前端端口：

```typescript
server: {
  port: 3000, // 修改为其他端口
}
```

在 `server/index.js` 中修改后端端口：

```javascript
const PORT = 3001; // 修改为其他端口
```

### 自定义股票数据

编辑 `server/data/stocks.js` 添加或修改股票数据。

### 调整技术指标参数

在 `server/utils/mockData.js` 中修改技术指标计算参数：

```javascript
calculateMA(data, 5)    // MA5周期
calculateRSI(data, 14)  // RSI周期
calculateKDJ(data, 9)   // KDJ周期
```

## 🎯 后续规划

- [ ] 接入真实股票数据API
- [ ] 添加更多技术指标（布林带、SAR等）
- [ ] 支持分时图
- [ ] 添加股票新闻和公告
- [ ] 实现股票对比功能
- [ ] 添加模拟交易功能
- [ ] 移动端优化
- [ ] 暗黑模式支持

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

如有问题或建议，请创建 Issue。

---

**享受使用 Stock Dreamer！** 📈✨