"""
股票分析服务 - 提供技术指标计算和分析功能
"""
import pandas as pd
import numpy as np
from typing import Dict, List


class AnalysisService:
    """股票分析服务类"""

    @staticmethod
    def calculate_ma(data: List[Dict], period: int = 20) -> List[float]:
        """
        计算移动平均线 (Moving Average)

        Args:
            data: 历史数据列表
            period: 周期

        Returns:
            移动平均值列表
        """
        df = pd.DataFrame(data)
        if 'close' not in df.columns or len(df) < period:
            return []

        ma = df['close'].rolling(window=period).mean()
        return ma.fillna(0).tolist()

    @staticmethod
    def calculate_ema(data: List[Dict], period: int = 12) -> List[float]:
        """
        计算指数移动平均线 (Exponential Moving Average)

        Args:
            data: 历史数据列表
            period: 周期

        Returns:
            EMA值列表
        """
        df = pd.DataFrame(data)
        if 'close' not in df.columns or len(df) < period:
            return []

        ema = df['close'].ewm(span=period, adjust=False).mean()
        return ema.fillna(0).tolist()

    @staticmethod
    def calculate_macd(data: List[Dict], fast: int = 12, slow: int = 26,
                      signal: int = 9) -> Dict[str, List[float]]:
        """
        计算MACD指标

        Args:
            data: 历史数据列表
            fast: 快线周期
            slow: 慢线周期
            signal: 信号线周期

        Returns:
            包含MACD、信号线和柱状图的字典
        """
        df = pd.DataFrame(data)
        if 'close' not in df.columns or len(df) < slow:
            return {'macd': [], 'signal': [], 'histogram': []}

        # 计算快慢EMA
        ema_fast = df['close'].ewm(span=fast, adjust=False).mean()
        ema_slow = df['close'].ewm(span=slow, adjust=False).mean()

        # MACD线
        macd = ema_fast - ema_slow

        # 信号线
        signal_line = macd.ewm(span=signal, adjust=False).mean()

        # 柱状图
        histogram = macd - signal_line

        return {
            'macd': macd.fillna(0).tolist(),
            'signal': signal_line.fillna(0).tolist(),
            'histogram': histogram.fillna(0).tolist()
        }

    @staticmethod
    def calculate_rsi(data: List[Dict], period: int = 14) -> List[float]:
        """
        计算相对强弱指标 (RSI)

        Args:
            data: 历史数据列表
            period: 周期

        Returns:
            RSI值列表
        """
        df = pd.DataFrame(data)
        if 'close' not in df.columns or len(df) < period + 1:
            return []

        # 计算价格变化
        delta = df['close'].diff()

        # 分离上涨和下跌
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()

        # 计算RS
        rs = gain / loss

        # 计算RSI
        rsi = 100 - (100 / (1 + rs))

        return rsi.fillna(50).tolist()

    @staticmethod
    def calculate_bollinger_bands(data: List[Dict], period: int = 20,
                                 std_dev: float = 2.0) -> Dict[str, List[float]]:
        """
        计算布林带 (Bollinger Bands)

        Args:
            data: 历史数据列表
            period: 周期
            std_dev: 标准差倍数

        Returns:
            包含上轨、中轨、下轨的字典
        """
        df = pd.DataFrame(data)
        if 'close' not in df.columns or len(df) < period:
            return {'upper': [], 'middle': [], 'lower': []}

        # 中轨（移动平均）
        middle = df['close'].rolling(window=period).mean()

        # 标准差
        std = df['close'].rolling(window=period).std()

        # 上下轨
        upper = middle + (std * std_dev)
        lower = middle - (std * std_dev)

        return {
            'upper': upper.fillna(0).tolist(),
            'middle': middle.fillna(0).tolist(),
            'lower': lower.fillna(0).tolist()
        }

    @staticmethod
    def calculate_kdj(data: List[Dict], period: int = 9,
                     k_period: int = 3, d_period: int = 3) -> Dict[str, List[float]]:
        """
        计算KDJ指标

        Args:
            data: 历史数据列表
            period: RSV周期
            k_period: K值周期
            d_period: D值周期

        Returns:
            包含K、D、J值的字典
        """
        df = pd.DataFrame(data)
        if len(df) < period:
            return {'k': [], 'd': [], 'j': []}

        # 计算RSV
        low_list = df['low'].rolling(window=period).min()
        high_list = df['high'].rolling(window=period).max()
        rsv = (df['close'] - low_list) / (high_list - low_list) * 100

        # 计算K和D
        k = rsv.ewm(com=k_period - 1).mean()
        d = k.ewm(com=d_period - 1).mean()

        # 计算J
        j = 3 * k - 2 * d

        return {
            'k': k.fillna(50).tolist(),
            'd': d.fillna(50).tolist(),
            'j': j.fillna(50).tolist()
        }

    @staticmethod
    def calculate_atr(data: List[Dict], period: int = 14) -> List[float]:
        """
        计算平均真实波幅 (ATR)

        Args:
            data: 历史数据列表
            period: 周期

        Returns:
            ATR值列表
        """
        df = pd.DataFrame(data)
        if len(df) < 2:
            return []

        # 计算TR (True Range)
        high_low = df['high'] - df['low']
        high_close = np.abs(df['high'] - df['close'].shift())
        low_close = np.abs(df['low'] - df['close'].shift())

        tr = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)

        # 计算ATR
        atr = tr.rolling(window=period).mean()

        return atr.fillna(0).tolist()

    @staticmethod
    def get_technical_indicators(data: List[Dict]) -> Dict:
        """
        计算所有技术指标

        Args:
            data: 历史数据列表

        Returns:
            包含所有技术指标的字典
        """
        if not data or len(data) < 2:
            return {}

        return {
            'ma5': AnalysisService.calculate_ma(data, 5),
            'ma10': AnalysisService.calculate_ma(data, 10),
            'ma20': AnalysisService.calculate_ma(data, 20),
            'ma60': AnalysisService.calculate_ma(data, 60),
            'ema12': AnalysisService.calculate_ema(data, 12),
            'ema26': AnalysisService.calculate_ema(data, 26),
            'macd': AnalysisService.calculate_macd(data),
            'rsi': AnalysisService.calculate_rsi(data),
            'bollinger': AnalysisService.calculate_bollinger_bands(data),
            'kdj': AnalysisService.calculate_kdj(data),
            'atr': AnalysisService.calculate_atr(data)
        }

    @staticmethod
    def analyze_trend(data: List[Dict]) -> Dict:
        """
        分析趋势

        Args:
            data: 历史数据列表

        Returns:
            趋势分析结果
        """
        if not data or len(data) < 20:
            return {'trend': 'unknown', 'strength': 0}

        df = pd.DataFrame(data)

        # 计算短期和长期均线
        ma_short = df['close'].rolling(window=5).mean().iloc[-1]
        ma_long = df['close'].rolling(window=20).mean().iloc[-1]
        current_price = df['close'].iloc[-1]

        # 判断趋势
        if ma_short > ma_long and current_price > ma_short:
            trend = 'bullish'
            strength = ((current_price - ma_long) / ma_long) * 100
        elif ma_short < ma_long and current_price < ma_short:
            trend = 'bearish'
            strength = ((ma_long - current_price) / ma_long) * 100
        else:
            trend = 'neutral'
            strength = 0

        return {
            'trend': trend,
            'strength': min(abs(strength), 100),
            'currentPrice': float(current_price),
            'ma5': float(ma_short),
            'ma20': float(ma_long)
        }
