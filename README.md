# Stock Dreamer 📈

一个现代化、动感的股票分析平台，提供实时股票数据、技术分析和可视化图表。

![Stock Dreamer](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ 主要功能

- 🔍 **智能搜索** - 快速搜索股票代码和公司名称
- 📊 **实时数据** - 获取实时股票价格和市场数据
- 📈 **技术分析** - 支持MA、MACD、RSI、布林带等多种技术指标
- 🎨 **动感交互** - 流畅的动画和现代化UI设计
- ⭐ **自选股** - 管理你的股票关注列表
- 📱 **响应式设计** - 完美适配桌面和移动设备

## 🛠️ 技术栈

### 后端
- **Python 3.8+**
- **Flask** - Web框架
- **yfinance** - 股票数据获取
- **pandas & numpy** - 数据处理和分析

### 前端
- **React 18** - UI框架
- **Vite** - 构建工具
- **TailwindCSS** - 样式框架
- **Recharts** - 图表库
- **Framer Motion** - 动画库
- **Axios** - HTTP客户端

## 📦 安装与运行

### 前置要求
- Python 3.8 或更高版本
- Node.js 16 或更高版本
- npm 或 yarn

### 后端安装

```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 运行后端服务
python app.py
```

后端服务将在 `http://localhost:5000` 运行

### 前端安装

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 运行开发服务器
npm run dev
```

前端应用将在 `http://localhost:3000` 运行

## 🚀 使用方法

1. 启动后端API服务器
2. 启动前端开发服务器
3. 在浏览器中打开 `http://localhost:3000`
4. 使用搜索栏搜索股票或从自选股列表中选择
5. 查看股票详情、价格走势和技术分析

## 📖 API文档

### 获取股票信息
```http
GET /api/stock/{symbol}
```

### 获取历史数据
```http
GET /api/stock/{symbol}/history?period=1mo&interval=1d
```

### 技术分析
```http
GET /api/stock/{symbol}/analysis?period=6mo
```

### 搜索股票
```http
GET /api/stocks/search?q=apple
```

### 比较股票
```http
POST /api/compare
Content-Type: application/json

{
  "symbols": ["AAPL", "GOOGL"],
  "period": "1mo"
}
```

## 🎨 功能特性

### 动感UI
- 流畅的页面过渡动画
- 交互式图表
- 实时数据更新
- 响应式卡片设计

### 技术指标
- MA (移动平均线) - 5/10/20/60日
- EMA (指数移动平均线)
- MACD (指数平滑异同移动平均线)
- RSI (相对强弱指标)
- 布林带
- KDJ指标
- ATR (平均真实波幅)

### 数据可视化
- 面积图
- 线图
- K线图
- 成交量柱状图
- 多指标叠加显示

## 📁 项目结构

```
stock-dreamer/
├── backend/
│   ├── services/
│   │   ├── stock_service.py      # 股票数据服务
│   │   └── analysis_service.py   # 技术分析服务
│   ├── app.py                     # Flask应用主文件
│   └── requirements.txt           # Python依赖
├── frontend/
│   ├── src/
│   │   ├── components/           # React组件
│   │   │   ├── StockCard.jsx
│   │   │   ├── StockChart.jsx
│   │   │   └── SearchBar.jsx
│   │   ├── services/
│   │   │   └── api.js            # API服务
│   │   ├── App.jsx               # 主应用组件
│   │   ├── main.jsx              # 入口文件
│   │   └── index.css             # 全局样式
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md

```

## ⚠️ 注意事项

- 本项目使用的股票数据来自 yfinance，数据可能存在延迟
- 仅供学习和研究使用，不构成投资建议
- 投资有风险，入市需谨慎

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👨‍💻 作者

Stock Dreamer Team

---

**免责声明**: 本软件提供的所有数据和分析仅供参考，不构成任何投资建议。使用本软件进行投资决策的风险由用户自行承担。