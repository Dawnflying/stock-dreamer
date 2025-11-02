"""
Stock Dreamer - 股票分析API服务
提供股票数据查询和技术分析功能
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from services.stock_service import StockService
from services.analysis_service import AnalysisService
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 创建Flask应用
app = Flask(__name__)
CORS(app)  # 启用跨域支持

# 初始化服务
stock_service = StockService()
analysis_service = AnalysisService()


@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({'status': 'healthy', 'service': 'Stock Dreamer API'}), 200


@app.route('/api/stock/<symbol>', methods=['GET'])
def get_stock_info(symbol):
    """
    获取股票基本信息

    Args:
        symbol: 股票代码
    """
    try:
        symbol = symbol.upper()
        logger.info(f"Fetching stock info for {symbol}")

        info = stock_service.get_stock_info(symbol)

        if not info:
            return jsonify({'error': 'Stock not found'}), 404

        # 计算涨跌幅
        if info['previousClose'] and info['currentPrice']:
            change = info['currentPrice'] - info['previousClose']
            change_percent = (change / info['previousClose']) * 100
            info['change'] = round(change, 2)
            info['changePercent'] = round(change_percent, 2)

        return jsonify(info), 200

    except Exception as e:
        logger.error(f"Error fetching stock info: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/stock/<symbol>/history', methods=['GET'])
def get_stock_history(symbol):
    """
    获取股票历史数据

    Args:
        symbol: 股票代码

    Query Params:
        period: 时间周期 (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, max)
        interval: 数据间隔 (1m, 5m, 15m, 1h, 1d, 1wk, 1mo)
    """
    try:
        symbol = symbol.upper()
        period = request.args.get('period', '1mo')
        interval = request.args.get('interval', '1d')

        logger.info(f"Fetching history for {symbol}, period={period}, interval={interval}")

        data = stock_service.get_historical_data(symbol, period, interval)

        if not data:
            return jsonify({'error': 'No data found'}), 404

        return jsonify({
            'symbol': symbol,
            'period': period,
            'interval': interval,
            'data': data
        }), 200

    except Exception as e:
        logger.error(f"Error fetching history: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/stock/<symbol>/intraday', methods=['GET'])
def get_stock_intraday(symbol):
    """
    获取股票日内数据

    Args:
        symbol: 股票代码
    """
    try:
        symbol = symbol.upper()
        logger.info(f"Fetching intraday data for {symbol}")

        data = stock_service.get_intraday_data(symbol)

        if not data:
            return jsonify({'error': 'No data found'}), 404

        return jsonify({
            'symbol': symbol,
            'data': data
        }), 200

    except Exception as e:
        logger.error(f"Error fetching intraday data: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/stock/<symbol>/quote', methods=['GET'])
def get_real_time_quote(symbol):
    """
    获取实时报价

    Args:
        symbol: 股票代码
    """
    try:
        symbol = symbol.upper()
        logger.info(f"Fetching real-time quote for {symbol}")

        quote = stock_service.get_real_time_quote(symbol)

        if not quote:
            # 如果实时数据获取失败，返回基本信息
            quote = stock_service.get_stock_info(symbol)

        if not quote:
            return jsonify({'error': 'Quote not found'}), 404

        return jsonify(quote), 200

    except Exception as e:
        logger.error(f"Error fetching quote: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/stock/<symbol>/analysis', methods=['GET'])
def get_stock_analysis(symbol):
    """
    获取股票技术分析

    Args:
        symbol: 股票代码

    Query Params:
        period: 时间周期 (默认: 6mo)
    """
    try:
        symbol = symbol.upper()
        period = request.args.get('period', '6mo')

        logger.info(f"Analyzing {symbol}, period={period}")

        # 获取历史数据
        data = stock_service.get_historical_data(symbol, period, '1d')

        if not data:
            return jsonify({'error': 'No data found'}), 404

        # 计算技术指标
        indicators = analysis_service.get_technical_indicators(data)

        # 趋势分析
        trend = analysis_service.analyze_trend(data)

        return jsonify({
            'symbol': symbol,
            'period': period,
            'indicators': indicators,
            'trend': trend,
            'dataPoints': len(data)
        }), 200

    except Exception as e:
        logger.error(f"Error analyzing stock: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/stocks/multiple', methods=['POST'])
def get_multiple_stocks():
    """
    获取多个股票信息

    Request Body:
        {
            "symbols": ["AAPL", "GOOGL", "MSFT"]
        }
    """
    try:
        data = request.get_json()
        symbols = data.get('symbols', [])

        if not symbols:
            return jsonify({'error': 'No symbols provided'}), 400

        # 转换为大写
        symbols = [s.upper() for s in symbols]

        logger.info(f"Fetching multiple stocks: {symbols}")

        results = stock_service.get_multiple_stocks(symbols)

        return jsonify({
            'stocks': results,
            'count': len(results)
        }), 200

    except Exception as e:
        logger.error(f"Error fetching multiple stocks: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/stocks/search', methods=['GET'])
def search_stocks():
    """
    搜索股票

    Query Params:
        q: 搜索关键词
    """
    try:
        query = request.args.get('q', '')

        if not query:
            return jsonify({'error': 'Query parameter required'}), 400

        logger.info(f"Searching stocks with query: {query}")

        results = stock_service.search_stocks(query)

        return jsonify({
            'query': query,
            'results': results,
            'count': len(results)
        }), 200

    except Exception as e:
        logger.error(f"Error searching stocks: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/compare', methods=['POST'])
def compare_stocks():
    """
    比较多个股票

    Request Body:
        {
            "symbols": ["AAPL", "GOOGL"],
            "period": "1mo"
        }
    """
    try:
        data = request.get_json()
        symbols = data.get('symbols', [])
        period = data.get('period', '1mo')

        if not symbols or len(symbols) < 2:
            return jsonify({'error': 'At least 2 symbols required'}), 400

        symbols = [s.upper() for s in symbols]

        logger.info(f"Comparing stocks: {symbols}")

        comparison = []

        for symbol in symbols:
            # 获取股票信息
            info = stock_service.get_stock_info(symbol)
            if not info:
                continue

            # 获取历史数据
            history = stock_service.get_historical_data(symbol, period, '1d')

            # 趋势分析
            trend = analysis_service.analyze_trend(history) if history else None

            comparison.append({
                'symbol': symbol,
                'info': info,
                'trend': trend,
                'dataPoints': len(history) if history else 0
            })

        return jsonify({
            'comparison': comparison,
            'period': period
        }), 200

    except Exception as e:
        logger.error(f"Error comparing stocks: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.errorhandler(404)
def not_found(error):
    """404错误处理"""
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    """500错误处理"""
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    logger.info("Starting Stock Dreamer API Server...")
    app.run(host='0.0.0.0', port=5000, debug=True)
