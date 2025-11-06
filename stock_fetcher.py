"""
Stock data fetching module using yfinance
"""
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Optional


class StockDataFetcher:
    """Fetch stock historical data from Yahoo Finance"""

    def __init__(self):
        self.supported_markets = {
            'US': '',  # No suffix for US stocks
            'HK': '.HK',  # Hong Kong stocks
            'SH': '.SS',  # Shanghai stocks
            'SZ': '.SZ',  # Shenzhen stocks
        }

    def fetch_stock_data(
        self,
        symbol: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        period: str = '1mo'
    ) -> pd.DataFrame:
        """
        Fetch historical stock data

        Args:
            symbol: Stock symbol (e.g., 'AAPL', '000001.SZ')
            start_date: Start date in 'YYYY-MM-DD' format
            end_date: End date in 'YYYY-MM-DD' format
            period: Time period if dates not specified (e.g., '1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', 'max')

        Returns:
            DataFrame with columns: Date, Open, High, Low, Close, Volume, Adjusted_Close
        """
        try:
            # Create ticker with headers to avoid 403 errors
            ticker = yf.Ticker(symbol)
            ticker.session.headers.update({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            })

            # Fetch data based on date range or period
            if start_date and end_date:
                data = ticker.history(start=start_date, end=end_date)
            elif start_date:
                data = ticker.history(start=start_date)
            else:
                data = ticker.history(period=period)

            if data.empty:
                print(f"No data found for symbol: {symbol}")
                return pd.DataFrame()

            # Reset index to make Date a column
            data = data.reset_index()

            # Rename columns to match database schema
            data = data.rename(columns={
                'Date': 'date',
                'Open': 'open',
                'High': 'high',
                'Low': 'low',
                'Close': 'close',
                'Volume': 'volume'
            })

            # Add adjusted close (use Close if Adj Close not available)
            if 'Adj Close' in data.columns:
                data['adjusted_close'] = data['Adj Close']
            else:
                data['adjusted_close'] = data['close']

            # Select only required columns
            columns = ['date', 'open', 'high', 'low', 'close', 'volume', 'adjusted_close']
            data = data[columns]

            # Convert date to date only (remove time part)
            data['date'] = pd.to_datetime(data['date']).dt.date

            # Add symbol column
            data['symbol'] = symbol

            print(f"Successfully fetched {len(data)} records for {symbol}")
            return data

        except Exception as e:
            print(f"Error fetching data for {symbol}: {e}")
            return pd.DataFrame()

    def fetch_multiple_stocks(
        self,
        symbols: List[str],
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        period: str = '1mo'
    ) -> pd.DataFrame:
        """
        Fetch historical data for multiple stocks

        Args:
            symbols: List of stock symbols
            start_date: Start date in 'YYYY-MM-DD' format
            end_date: End date in 'YYYY-MM-DD' format
            period: Time period if dates not specified

        Returns:
            Combined DataFrame with data from all symbols
        """
        all_data = []

        for symbol in symbols:
            print(f"\nFetching data for {symbol}...")
            data = self.fetch_stock_data(symbol, start_date, end_date, period)
            if not data.empty:
                all_data.append(data)

        if all_data:
            combined_data = pd.concat(all_data, ignore_index=True)
            print(f"\nTotal records fetched: {len(combined_data)}")
            return combined_data
        else:
            print("No data fetched for any symbol")
            return pd.DataFrame()

    def get_stock_info(self, symbol: str) -> dict:
        """
        Get basic information about a stock

        Args:
            symbol: Stock symbol

        Returns:
            Dictionary with stock information
        """
        try:
            ticker = yf.Ticker(symbol)
            ticker.session.headers.update({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            })
            info = ticker.info if hasattr(ticker, 'info') else {}
            return {
                'symbol': symbol,
                'name': info.get('longName', 'N/A'),
                'sector': info.get('sector', 'N/A'),
                'industry': info.get('industry', 'N/A'),
                'market_cap': info.get('marketCap', 'N/A'),
                'currency': info.get('currency', 'N/A')
            }
        except Exception as e:
            print(f"Error fetching info for {symbol}: {e}")
            return {}
