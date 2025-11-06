#!/usr/bin/env python3
"""
Main script for fetching and storing stock historical data
"""
import argparse
from datetime import datetime, timedelta
from database import DatabaseManager
from stock_fetcher import StockDataFetcher
from data_storage import StockDataStorage


def fetch_and_store(
    symbols,
    start_date=None,
    end_date=None,
    period='1mo',
    update_existing=True,
    delay=3
):
    """
    Fetch stock data and store in database

    Args:
        symbols: List of stock symbols
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        period: Time period if dates not specified
        update_existing: Whether to update existing records
        delay: Delay between fetching different stocks (seconds)
    """
    print("=" * 60)
    print("Stock Data Fetcher")
    print("=" * 60)

    # Initialize database manager
    db_manager = DatabaseManager()
    if not db_manager.connect():
        print("Failed to connect to database. Exiting.")
        return

    # Test connection
    if not db_manager.test_connection():
        print("Database connection test failed. Exiting.")
        return

    # Create tables if they don't exist
    db_manager.create_tables()

    # Initialize fetcher and storage
    fetcher = StockDataFetcher(delay_between_requests=2)
    storage = StockDataStorage(db_manager)

    # Fetch data
    print(f"\nFetching data for symbols: {', '.join(symbols)}")
    if start_date and end_date:
        print(f"Date range: {start_date} to {end_date}")
    else:
        print(f"Period: {period}")
    print(f"Delay between stocks: {delay}s")

    data = fetcher.fetch_multiple_stocks(
        symbols=symbols,
        start_date=start_date,
        end_date=end_date,
        period=period,
        delay_between_stocks=delay
    )

    # Store data
    if not data.empty:
        print("\n" + "=" * 60)
        print("Saving data to database...")
        print("=" * 60)
        storage.save_stock_data(data, update_existing=update_existing)
    else:
        print("\nNo data to save.")

    print("\n" + "=" * 60)
    print("Process completed successfully!")
    print("=" * 60)


def query_data(symbol, start_date=None, end_date=None, limit=10):
    """
    Query stock data from database

    Args:
        symbol: Stock symbol
        start_date: Start date filter
        end_date: End date filter
        limit: Maximum number of records
    """
    db_manager = DatabaseManager()
    if not db_manager.connect():
        print("Failed to connect to database. Exiting.")
        return

    storage = StockDataStorage(db_manager)
    results = storage.get_stock_data(symbol, start_date, end_date, limit)

    print(f"\nQuery results for {symbol}:")
    print("=" * 80)
    print(f"{'Date':<12} {'Open':<10} {'High':<10} {'Low':<10} {'Close':<10} {'Volume':<15}")
    print("=" * 80)

    for record in results:
        print(f"{str(record['date']):<12} "
              f"{record['open']:<10.2f} "
              f"{record['high']:<10.2f} "
              f"{record['low']:<10.2f} "
              f"{record['close']:<10.2f} "
              f"{record['volume']:<15.0f}")

    print("=" * 80)
    print(f"Total records: {len(results)}")


def main():
    parser = argparse.ArgumentParser(description='Stock Historical Data Fetcher')
    subparsers = parser.add_subparsers(dest='command', help='Available commands')

    # Fetch command
    fetch_parser = subparsers.add_parser('fetch', help='Fetch and store stock data')
    fetch_parser.add_argument('symbols', nargs='+', help='Stock symbols (e.g., AAPL MSFT GOOGL)')
    fetch_parser.add_argument('--start', help='Start date (YYYY-MM-DD)')
    fetch_parser.add_argument('--end', help='End date (YYYY-MM-DD)')
    fetch_parser.add_argument('--period', default='1mo',
                            help='Time period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, max)')
    fetch_parser.add_argument('--delay', type=int, default=3,
                            help='Delay between fetching different stocks in seconds (default: 3)')
    fetch_parser.add_argument('--no-update', action='store_true',
                            help='Skip updating existing records')

    # Query command
    query_parser = subparsers.add_parser('query', help='Query stock data from database')
    query_parser.add_argument('symbol', help='Stock symbol')
    query_parser.add_argument('--start', help='Start date (YYYY-MM-DD)')
    query_parser.add_argument('--end', help='End date (YYYY-MM-DD)')
    query_parser.add_argument('--limit', type=int, default=10, help='Maximum records to return')

    args = parser.parse_args()

    if args.command == 'fetch':
        fetch_and_store(
            symbols=args.symbols,
            start_date=args.start,
            end_date=args.end,
            period=args.period,
            update_existing=not args.no_update,
            delay=args.delay
        )
    elif args.command == 'query':
        query_data(
            symbol=args.symbol,
            start_date=args.start,
            end_date=args.end,
            limit=args.limit
        )
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
