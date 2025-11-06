#!/usr/bin/env python3
"""
Example usage script demonstrating how to use the stock data fetcher
"""
from database import DatabaseManager
from stock_fetcher import StockDataFetcher
from data_storage import StockDataStorage


def example_1_fetch_us_stocks():
    """Example 1: Fetch data for US stocks"""
    print("\n" + "=" * 60)
    print("Example 1: Fetching US Tech Stocks")
    print("=" * 60)

    db_manager = DatabaseManager()
    db_manager.connect()
    db_manager.create_tables()

    fetcher = StockDataFetcher()
    storage = StockDataStorage(db_manager)

    # Fetch data for US tech stocks
    symbols = ['AAPL', 'MSFT', 'GOOGL']
    data = fetcher.fetch_multiple_stocks(symbols, period='1mo')

    if not data.empty:
        storage.save_stock_data(data)


def example_2_fetch_chinese_stocks():
    """Example 2: Fetch data for Chinese stocks"""
    print("\n" + "=" * 60)
    print("Example 2: Fetching Chinese Stocks")
    print("=" * 60)

    db_manager = DatabaseManager()
    db_manager.connect()
    db_manager.create_tables()

    fetcher = StockDataFetcher()
    storage = StockDataStorage(db_manager)

    # Fetch data for Chinese stocks
    symbols = ['600000.SS', '000001.SZ']  # Shanghai and Shenzhen stocks
    data = fetcher.fetch_multiple_stocks(symbols, period='3mo')

    if not data.empty:
        storage.save_stock_data(data)


def example_3_fetch_with_date_range():
    """Example 3: Fetch data with specific date range"""
    print("\n" + "=" * 60)
    print("Example 3: Fetching with Date Range")
    print("=" * 60)

    db_manager = DatabaseManager()
    db_manager.connect()
    db_manager.create_tables()

    fetcher = StockDataFetcher()
    storage = StockDataStorage(db_manager)

    # Fetch data for specific date range
    data = fetcher.fetch_stock_data(
        symbol='AAPL',
        start_date='2024-01-01',
        end_date='2024-12-31'
    )

    if not data.empty:
        storage.save_stock_data(data)


def example_4_query_data():
    """Example 4: Query data from database"""
    print("\n" + "=" * 60)
    print("Example 4: Querying Data from Database")
    print("=" * 60)

    db_manager = DatabaseManager()
    db_manager.connect()

    storage = StockDataStorage(db_manager)

    # Query latest data for AAPL
    results = storage.get_stock_data('AAPL', limit=10)

    print(f"\nLatest 10 records for AAPL:")
    for record in results:
        print(f"  {record['date']}: Close={record['close']:.2f}, Volume={record['volume']:.0f}")


def example_5_incremental_update():
    """Example 5: Incremental update - fetch only new data"""
    print("\n" + "=" * 60)
    print("Example 5: Incremental Update")
    print("=" * 60)

    db_manager = DatabaseManager()
    db_manager.connect()
    db_manager.create_tables()

    fetcher = StockDataFetcher()
    storage = StockDataStorage(db_manager)

    symbol = 'AAPL'

    # Get latest date in database
    latest_date = storage.get_latest_date(symbol)

    if latest_date:
        print(f"Latest date in database for {symbol}: {latest_date}")
        # Fetch data from the day after latest date
        from datetime import timedelta
        start_date = (latest_date + timedelta(days=1)).strftime('%Y-%m-%d')
        print(f"Fetching data from {start_date} onwards...")

        data = fetcher.fetch_stock_data(symbol, start_date=start_date)
    else:
        print(f"No existing data for {symbol}, fetching last 3 months...")
        data = fetcher.fetch_stock_data(symbol, period='3mo')

    if not data.empty:
        storage.save_stock_data(data)


def example_6_get_stock_info():
    """Example 6: Get stock information"""
    print("\n" + "=" * 60)
    print("Example 6: Getting Stock Information")
    print("=" * 60)

    fetcher = StockDataFetcher()

    symbols = ['AAPL', 'MSFT', 'GOOGL']

    for symbol in symbols:
        info = fetcher.get_stock_info(symbol)
        print(f"\n{symbol}:")
        print(f"  Name: {info.get('name')}")
        print(f"  Sector: {info.get('sector')}")
        print(f"  Industry: {info.get('industry')}")
        print(f"  Market Cap: {info.get('market_cap')}")


if __name__ == '__main__':
    print("Stock Data Fetcher - Example Usage")
    print("=" * 60)

    # Uncomment the examples you want to run:

    # example_1_fetch_us_stocks()
    # example_2_fetch_chinese_stocks()
    # example_3_fetch_with_date_range()
    # example_4_query_data()
    # example_5_incremental_update()
    # example_6_get_stock_info()

    print("\n" + "=" * 60)
    print("To run examples, uncomment the function calls above.")
    print("=" * 60)
