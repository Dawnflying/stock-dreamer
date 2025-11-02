"""
股票数据服务 - 提供股票实时数据和历史数据获取功能
"""
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import numpy as np


class StockService:
    """股票数据服务类"""

    def __init__(self):
        self.cache = {}
        self.cache_timeout = 60  # 缓存60秒

    def get_stock_info(self, symbol: str) -> Dict:
        """
        获取股票基本信息

        Args:
            symbol: 股票代码

        Returns:
            股票基本信息字典
        """
        try:
            stock = yf.Ticker(symbol)
            info = stock.info

            return {
                'symbol': symbol,
                'name': info.get('longName', symbol),
                'currentPrice': info.get('currentPrice', info.get('regularMarketPrice', 0)),
                'previousClose': info.get('previousClose', 0),
                'open': info.get('open', 0),
                'dayHigh': info.get('dayHigh', 0),
                'dayLow': info.get('dayLow', 0),
                'volume': info.get('volume', 0),
                'marketCap': info.get('marketCap', 0),
                'pe': info.get('trailingPE', 0),
                'eps': info.get('trailingEps', 0),
                'dividendYield': info.get('dividendYield', 0),
                'fiftyTwoWeekHigh': info.get('fiftyTwoWeekHigh', 0),
                'fiftyTwoWeekLow': info.get('fiftyTwoWeekLow', 0),
                'change': 0,
                'changePercent': 0
            }
        except Exception as e:
            print(f"Error fetching stock info for {symbol}: {str(e)}")
            return None

    def get_historical_data(self, symbol: str, period: str = "1mo",
                           interval: str = "1d") -> List[Dict]:
        """
        获取股票历史数据

        Args:
            symbol: 股票代码
            period: 时间周期 (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
            interval: 数据间隔 (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)

        Returns:
            历史数据列表
        """
        try:
            stock = yf.Ticker(symbol)
            hist = stock.history(period=period, interval=interval)

            data = []
            for index, row in hist.iterrows():
                data.append({
                    'date': index.strftime('%Y-%m-%d %H:%M:%S'),
                    'timestamp': int(index.timestamp() * 1000),
                    'open': float(row['Open']),
                    'high': float(row['High']),
                    'low': float(row['Low']),
                    'close': float(row['Close']),
                    'volume': int(row['Volume'])
                })

            return data
        except Exception as e:
            print(f"Error fetching historical data for {symbol}: {str(e)}")
            return []

    def get_intraday_data(self, symbol: str) -> List[Dict]:
        """
        获取股票日内数据（最近5天，1小时间隔）

        Args:
            symbol: 股票代码

        Returns:
            日内数据列表
        """
        return self.get_historical_data(symbol, period="5d", interval="1h")

    def get_multiple_stocks(self, symbols: List[str]) -> List[Dict]:
        """
        获取多个股票的信息

        Args:
            symbols: 股票代码列表

        Returns:
            股票信息列表
        """
        results = []
        for symbol in symbols:
            info = self.get_stock_info(symbol)
            if info:
                results.append(info)
        return results

    def search_stocks(self, query: str) -> List[Dict]:
        """
        搜索股票

        Args:
            query: 搜索关键词

        Returns:
            匹配的股票列表
        """
        # 这里简单实现，实际应该使用更强大的搜索API
        common_stocks = {
            'AAPL': 'Apple Inc.',
            'GOOGL': 'Alphabet Inc.',
            'MSFT': 'Microsoft Corporation',
            'AMZN': 'Amazon.com Inc.',
            'TSLA': 'Tesla Inc.',
            'META': 'Meta Platforms Inc.',
            'NVDA': 'NVIDIA Corporation',
            'JPM': 'JPMorgan Chase & Co.',
            'V': 'Visa Inc.',
            'WMT': 'Walmart Inc.',
            'JNJ': 'Johnson & Johnson',
            'PG': 'Procter & Gamble Co.',
            'MA': 'Mastercard Inc.',
            'DIS': 'The Walt Disney Company',
            'NFLX': 'Netflix Inc.',
            'BABA': 'Alibaba Group Holding Limited',
            'TCEHY': 'Tencent Holdings Limited',
            '0700.HK': 'Tencent Holdings Ltd',
            '9988.HK': 'Alibaba Group Holding Limited',
        }

        query = query.upper()
        results = []

        for symbol, name in common_stocks.items():
            if query in symbol or query in name.upper():
                results.append({
                    'symbol': symbol,
                    'name': name
                })

        return results[:10]  # 返回前10个结果

    def get_real_time_quote(self, symbol: str) -> Dict:
        """
        获取实时报价

        Args:
            symbol: 股票代码

        Returns:
            实时报价数据
        """
        try:
            stock = yf.Ticker(symbol)

            # 获取最新的日内数据
            hist = stock.history(period="1d", interval="1m")

            if hist.empty:
                return None

            latest = hist.iloc[-1]
            previous_close = stock.info.get('previousClose', 0)

            current_price = float(latest['Close'])
            change = current_price - previous_close if previous_close else 0
            change_percent = (change / previous_close * 100) if previous_close else 0

            return {
                'symbol': symbol,
                'price': current_price,
                'change': change,
                'changePercent': change_percent,
                'volume': int(latest['Volume']),
                'timestamp': int(hist.index[-1].timestamp() * 1000)
            }
        except Exception as e:
            print(f"Error fetching real-time quote for {symbol}: {str(e)}")
            return None
