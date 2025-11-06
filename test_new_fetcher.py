#!/usr/bin/env python3
"""
Test the improved stock data fetcher with retry logic
"""
from stock_fetcher import StockDataFetcher

def test_single_stock():
    """Test fetching a single stock"""
    print("=" * 60)
    print("Test: Fetching single stock (AAPL) with retry logic")
    print("=" * 60)

    fetcher = StockDataFetcher(delay_between_requests=2)
    data = fetcher.fetch_stock_data('AAPL', period='5d')

    if not data.empty:
        print(f"\n✓ Test PASSED: Fetched {len(data)} records")
        print("\nSample data (first 3 rows):")
        print(data.head(3).to_string())
    else:
        print("\n✗ Test FAILED: No data fetched")

    return not data.empty


def test_multiple_stocks():
    """Test fetching multiple stocks"""
    print("\n" + "=" * 60)
    print("Test: Fetching multiple stocks with delays")
    print("=" * 60)

    fetcher = StockDataFetcher(delay_between_requests=2)
    symbols = ['AAPL', 'MSFT']

    data = fetcher.fetch_multiple_stocks(
        symbols=symbols,
        period='5d',
        delay_between_stocks=3
    )

    if not data.empty:
        print(f"\n✓ Test PASSED: Fetched data for multiple stocks")
        print(f"Total records: {len(data)}")
        print(f"Symbols: {data['symbol'].unique().tolist()}")
    else:
        print("\n✗ Test FAILED: No data fetched")

    return not data.empty


def test_date_range():
    """Test fetching with date range"""
    print("\n" + "=" * 60)
    print("Test: Fetching with specific date range")
    print("=" * 60)

    fetcher = StockDataFetcher(delay_between_requests=2)
    data = fetcher.fetch_stock_data(
        'AAPL',
        start_date='2024-11-01',
        end_date='2024-11-05'
    )

    if not data.empty:
        print(f"\n✓ Test PASSED: Fetched {len(data)} records")
        print(f"Date range: {data['date'].min()} to {data['date'].max()}")
    else:
        print("\n✗ Test FAILED: No data fetched")

    return not data.empty


if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("STOCK DATA FETCHER - IMPROVED VERSION TEST")
    print("=" * 60)

    results = []

    # Run tests
    results.append(("Single Stock", test_single_stock()))
    results.append(("Multiple Stocks", test_multiple_stocks()))
    results.append(("Date Range", test_date_range()))

    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)

    for test_name, passed in results:
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{test_name}: {status}")

    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)

    print(f"\nTotal: {passed_count}/{total_count} tests passed")

    if passed_count == total_count:
        print("\n🎉 All tests passed!")
    else:
        print(f"\n⚠️  {total_count - passed_count} test(s) failed")
