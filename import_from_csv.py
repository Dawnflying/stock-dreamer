#!/usr/bin/env python3
"""
Utility to import historical stock data from CSV files
"""
import argparse
import pandas as pd
from database import DatabaseManager
from data_storage import StockDataStorage


def import_csv(csv_file, symbol=None, date_column='Date', update_existing=True):
    """
    Import stock data from CSV file

    CSV format expected:
    Date,Open,High,Low,Close,Volume,Adj Close
    2024-01-01,150.0,152.0,149.0,151.0,1000000,151.0

    Args:
        csv_file: Path to CSV file
        symbol: Stock symbol (if not in CSV)
        date_column: Name of date column
        update_existing: Whether to update existing records
    """
    print("=" * 60)
    print("CSV Data Importer")
    print("=" * 60)

    # Read CSV
    print(f"\nReading CSV file: {csv_file}")
    try:
        data = pd.read_csv(csv_file)
        print(f"✓ Read {len(data)} rows from CSV")
    except Exception as e:
        print(f"✗ Error reading CSV: {e}")
        return

    # Check required columns
    required_columns = [date_column, 'Open', 'High', 'Low', 'Close', 'Volume']
    missing_columns = [col for col in required_columns if col not in data.columns]

    if missing_columns:
        print(f"✗ Missing required columns: {missing_columns}")
        print(f"Available columns: {data.columns.tolist()}")
        return

    # Standardize column names
    data = data.rename(columns={
        date_column: 'date',
        'Open': 'open',
        'High': 'high',
        'Low': 'low',
        'Close': 'close',
        'Volume': 'volume'
    })

    # Add adjusted close if not present
    if 'Adj Close' in data.columns:
        data['adjusted_close'] = data['Adj Close']
    elif 'adjusted_close' not in data.columns:
        data['adjusted_close'] = data['close']

    # Add symbol
    if 'Symbol' in data.columns:
        # Symbol is in CSV
        pass
    elif symbol:
        # Symbol provided as argument
        data['symbol'] = symbol
    else:
        print("✗ No symbol found. Either include 'Symbol' column in CSV or provide --symbol argument")
        return

    # Convert date
    data['date'] = pd.to_datetime(data['date']).dt.date

    # Select required columns
    data = data[['symbol', 'date', 'open', 'high', 'low', 'close', 'volume', 'adjusted_close']]

    print(f"\nProcessed data:")
    print(f"  Symbols: {data['symbol'].unique().tolist()}")
    print(f"  Date range: {data['date'].min()} to {data['date'].max()}")
    print(f"  Total records: {len(data)}")

    # Connect to database
    print("\nConnecting to database...")
    db_manager = DatabaseManager()

    if not db_manager.connect():
        print("✗ Database connection failed")
        return

    print("✓ Database connected")

    # Create tables
    db_manager.create_tables()

    # Save data
    print("\nSaving data to database...")
    storage = StockDataStorage(db_manager)
    stats = storage.save_stock_data(data, update_existing=update_existing)

    print("\n" + "=" * 60)
    print("Import completed successfully!")
    print("=" * 60)


def main():
    parser = argparse.ArgumentParser(description='Import stock data from CSV file')
    parser.add_argument('file', help='Path to CSV file')
    parser.add_argument('--symbol', help='Stock symbol (if not in CSV)')
    parser.add_argument('--date-column', default='Date', help='Name of date column (default: Date)')
    parser.add_argument('--no-update', action='store_true', help='Skip updating existing records')

    args = parser.parse_args()

    import_csv(
        csv_file=args.file,
        symbol=args.symbol,
        date_column=args.date_column,
        update_existing=not args.no_update
    )


if __name__ == '__main__':
    main()
