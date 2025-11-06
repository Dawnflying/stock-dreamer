"""
Stock data fetching module with multiple data sources and retry logic
"""
import yfinance as yf
import pandas as pd
import time
from datetime import datetime, timedelta
from typing import List, Optional
from retry import retry
import random


class StockDataFetcher:
    """Fetch stock historical data from multiple data sources"""

    def __init__(self, delay_between_requests=2):
        self.supported_markets = {
            'US': '',  # No suffix for US stocks
            'HK': '.HK',  # Hong Kong stocks
            'SH': '.SS',  # Shanghai stocks
            'SZ': '.SZ',  # Shenzhen stocks
        }
        self.delay_between_requests = delay_between_requests
        self.last_request_time = 0

    def _wait_for_rate_limit(self):
        """Add delay between requests to avoid rate limiting"""
        current_time = time.time()
        time_since_last_request = current_time - self.last_request_time

        if time_since_last_request < self.delay_between_requests:
            sleep_time = self.delay_between_requests - time_since_last_request
            # Add random jitter to avoid synchronized requests
            sleep_time += random.uniform(0, 1)
            print(f"  Waiting {sleep_time:.1f}s to avoid rate limiting...")
            time.sleep(sleep_time)

        self.last_request_time = time.time()

    def _fetch_with_yfinance_download(
        self,
        symbol: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        period: str = '1mo'
    ) -> pd.DataFrame:
        """
        Fetch data using yfinance.download (more reliable than Ticker.history)
        """
        try:
            self._wait_for_rate_limit()

            # Use download method which is more stable
            if start_date and end_date:
                data = yf.download(
                    symbol,
                    start=start_date,
                    end=end_date,
                    progress=False,
                    timeout=30
                )
            elif start_date:
                data = yf.download(
                    symbol,
                    start=start_date,
                    progress=False,
                    timeout=30
                )
            else:
                data = yf.download(
                    symbol,
                    period=period,
                    progress=False,
                    timeout=30
                )

            return data

        except Exception as e:
            print(f"  yfinance.download error: {e}")
            return pd.DataFrame()

    def _fetch_with_akshare(
        self,
        symbol: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> pd.DataFrame:
        """
        Fetch Chinese stock data using AkShare (alternative for CN stocks)
        """
        try:
            import akshare as ak

            # Only works for Chinese stocks
            if not (symbol.endswith('.SS') or symbol.endswith('.SZ')):
                return pd.DataFrame()

            # Convert symbol format (remove suffix)
            stock_code = symbol.replace('.SS', '').replace('.SZ', '')

            # Add delay
            self._wait_for_rate_limit()

            # Fetch data using akshare
            print(f"  Trying AkShare for Chinese stock {stock_code}...")
            data = ak.stock_zh_a_hist(
                symbol=stock_code,
                start_date=start_date.replace('-', '') if start_date else '20200101',
                end_date=end_date.replace('-', '') if end_date else datetime.now().strftime('%Y%m%d'),
                adjust="qfq"  # Forward adjusted
            )

            if not data.empty:
                # Rename columns to match our schema
                data = data.rename(columns={
                    '日期': 'date',
                    '开盘': 'open',
                    '最高': 'high',
                    '最低': 'low',
                    '收盘': 'close',
                    '成交量': 'volume'
                })
                data['adjusted_close'] = data['close']

            return data

        except ImportError:
            print("  AkShare not available")
            return pd.DataFrame()
        except Exception as e:
            print(f"  AkShare error: {e}")
            return pd.DataFrame()

    def fetch_stock_data(
        self,
        symbol: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        period: str = '1mo',
        max_retries: int = 3
    ) -> pd.DataFrame:
        """
        Fetch historical stock data with retry logic and multiple data sources

        Args:
            symbol: Stock symbol (e.g., 'AAPL', '000001.SZ')
            start_date: Start date in 'YYYY-MM-DD' format
            end_date: End date in 'YYYY-MM-DD' format
            period: Time period if dates not specified (e.g., '1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', 'max')
            max_retries: Maximum number of retry attempts

        Returns:
            DataFrame with columns: date, open, high, low, close, volume, adjusted_close, symbol
        """

        # Try multiple times with different methods
        for attempt in range(max_retries):
            if attempt > 0:
                wait_time = 2 ** attempt + random.uniform(0, 2)  # Exponential backoff
                print(f"  Retry attempt {attempt + 1}/{max_retries} after {wait_time:.1f}s...")
                time.sleep(wait_time)

            # Try yfinance download method first
            data = self._fetch_with_yfinance_download(symbol, start_date, end_date, period)

            # If yfinance fails and it's a Chinese stock, try akshare
            if data.empty and (symbol.endswith('.SS') or symbol.endswith('.SZ')):
                data = self._fetch_with_akshare(symbol, start_date, end_date)

            # Process data if we got something
            if not data.empty:
                try:
                    # Reset index to make Date a column
                    data = data.reset_index()

                    # Standardize column names
                    column_mapping = {
                        'Date': 'date',
                        'Open': 'open',
                        'High': 'high',
                        'Low': 'low',
                        'Close': 'close',
                        'Volume': 'volume',
                        'Adj Close': 'adjusted_close'
                    }

                    for old_col, new_col in column_mapping.items():
                        if old_col in data.columns:
                            data = data.rename(columns={old_col: new_col})

                    # Add adjusted close if not present
                    if 'adjusted_close' not in data.columns:
                        data['adjusted_close'] = data['close']

                    # Select only required columns
                    columns = ['date', 'open', 'high', 'low', 'close', 'volume', 'adjusted_close']
                    data = data[columns]

                    # Convert date to date only (remove time part)
                    data['date'] = pd.to_datetime(data['date']).dt.date

                    # Add symbol column
                    data['symbol'] = symbol

                    # Remove any rows with NaN in critical columns
                    data = data.dropna(subset=['date', 'close'])

                    if not data.empty:
                        print(f"✓ Successfully fetched {len(data)} records for {symbol}")
                        return data

                except Exception as e:
                    print(f"  Error processing data: {e}")
                    continue

        print(f"✗ Failed to fetch data for {symbol} after {max_retries} attempts")
        return pd.DataFrame()

    def fetch_multiple_stocks(
        self,
        symbols: List[str],
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        period: str = '1mo',
        delay_between_stocks: int = 3
    ) -> pd.DataFrame:
        """
        Fetch historical data for multiple stocks with delays between each

        Args:
            symbols: List of stock symbols
            start_date: Start date in 'YYYY-MM-DD' format
            end_date: End date in 'YYYY-MM-DD' format
            period: Time period if dates not specified
            delay_between_stocks: Delay in seconds between fetching different stocks

        Returns:
            Combined DataFrame with data from all symbols
        """
        all_data = []
        total_symbols = len(symbols)

        for idx, symbol in enumerate(symbols, 1):
            print(f"\n[{idx}/{total_symbols}] Fetching data for {symbol}...")

            data = self.fetch_stock_data(symbol, start_date, end_date, period)

            if not data.empty:
                all_data.append(data)

            # Add delay between stocks (except after the last one)
            if idx < total_symbols and delay_between_stocks > 0:
                print(f"  Waiting {delay_between_stocks}s before next stock...")
                time.sleep(delay_between_stocks)

        if all_data:
            combined_data = pd.concat(all_data, ignore_index=True)
            print(f"\n{'='*60}")
            print(f"✓ Successfully fetched data for {len(all_data)}/{total_symbols} stocks")
            print(f"✓ Total records: {len(combined_data)}")
            print(f"{'='*60}")
            return combined_data
        else:
            print(f"\n✗ No data fetched for any symbol")
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
            self._wait_for_rate_limit()

            ticker = yf.Ticker(symbol)
            info = ticker.info if hasattr(ticker, 'info') and ticker.info else {}

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
            return {'symbol': symbol}
