#!/usr/bin/env python3
"""
Test stock data fetcher without database
"""
from stock_fetcher import StockDataFetcher

def test_fetch():
    """Test fetching stock data"""
    print("Testing stock data fetcher...")
    print("=" * 60)

    fetcher = StockDataFetcher()

    # Test fetching a single stock
    print("\nTest 1: Fetching Apple (AAPL) stock data for last 5 days")
    data = fetcher.fetch_stock_data('AAPL', period='5d')

    if not data.empty:
        print(f"✓ Successfully fetched {len(data)} records")
        print("\nSample data:")
        print(data.head())
    else:
        print("✗ Failed to fetch data")

    # Test fetching stock info
    print("\n" + "=" * 60)
    print("\nTest 2: Getting stock information")
    info = fetcher.get_stock_info('AAPL')
    print(f"✓ Stock info retrieved:")
    for key, value in info.items():
        print(f"  {key}: {value}")

    print("\n" + "=" * 60)
    print("Fetcher test completed successfully!")

if __name__ == '__main__':
    test_fetch()
