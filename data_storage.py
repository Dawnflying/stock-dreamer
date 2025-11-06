"""
Data storage module for saving stock data to database
"""
import pandas as pd
from sqlalchemy.exc import IntegrityError
from database import DatabaseManager, StockHistory
from datetime import datetime


class StockDataStorage:
    """Handle storage of stock data to database"""

    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager

    def save_stock_data(self, data: pd.DataFrame, update_existing: bool = True) -> dict:
        """
        Save stock data to database

        Args:
            data: DataFrame with stock data
            update_existing: Whether to update existing records

        Returns:
            Dictionary with statistics about the operation
        """
        if data.empty:
            print("No data to save")
            return {'inserted': 0, 'updated': 0, 'skipped': 0, 'errors': 0}

        session = self.db_manager.get_session()
        stats = {'inserted': 0, 'updated': 0, 'skipped': 0, 'errors': 0}

        try:
            for _, row in data.iterrows():
                try:
                    # Check if record already exists
                    existing = session.query(StockHistory).filter_by(
                        symbol=row['symbol'],
                        date=row['date']
                    ).first()

                    if existing:
                        if update_existing:
                            # Update existing record
                            existing.open = float(row['open']) if pd.notna(row['open']) else None
                            existing.high = float(row['high']) if pd.notna(row['high']) else None
                            existing.low = float(row['low']) if pd.notna(row['low']) else None
                            existing.close = float(row['close']) if pd.notna(row['close']) else None
                            existing.volume = float(row['volume']) if pd.notna(row['volume']) else None
                            existing.adjusted_close = float(row['adjusted_close']) if pd.notna(row['adjusted_close']) else None
                            existing.updated_at = datetime.now()
                            stats['updated'] += 1
                        else:
                            stats['skipped'] += 1
                    else:
                        # Insert new record
                        stock_record = StockHistory(
                            symbol=row['symbol'],
                            date=row['date'],
                            open=float(row['open']) if pd.notna(row['open']) else None,
                            high=float(row['high']) if pd.notna(row['high']) else None,
                            low=float(row['low']) if pd.notna(row['low']) else None,
                            close=float(row['close']) if pd.notna(row['close']) else None,
                            volume=float(row['volume']) if pd.notna(row['volume']) else None,
                            adjusted_close=float(row['adjusted_close']) if pd.notna(row['adjusted_close']) else None
                        )
                        session.add(stock_record)
                        stats['inserted'] += 1

                except Exception as e:
                    print(f"Error processing row {row['symbol']} - {row['date']}: {e}")
                    stats['errors'] += 1
                    continue

            # Commit all changes
            session.commit()
            print(f"\nData saved successfully:")
            print(f"  - Inserted: {stats['inserted']}")
            print(f"  - Updated: {stats['updated']}")
            print(f"  - Skipped: {stats['skipped']}")
            print(f"  - Errors: {stats['errors']}")

        except Exception as e:
            session.rollback()
            print(f"Error saving data: {e}")
            stats['errors'] += 1
        finally:
            session.close()

        return stats

    def get_latest_date(self, symbol: str):
        """
        Get the latest date for which data exists for a symbol

        Args:
            symbol: Stock symbol

        Returns:
            Latest date or None
        """
        session = self.db_manager.get_session()
        try:
            result = session.query(StockHistory).filter_by(
                symbol=symbol
            ).order_by(StockHistory.date.desc()).first()

            if result:
                return result.date
            return None
        finally:
            session.close()

    def get_stock_data(self, symbol: str, start_date=None, end_date=None, limit=100):
        """
        Retrieve stock data from database

        Args:
            symbol: Stock symbol
            start_date: Start date filter
            end_date: End date filter
            limit: Maximum number of records to return

        Returns:
            List of stock records
        """
        session = self.db_manager.get_session()
        try:
            query = session.query(StockHistory).filter_by(symbol=symbol)

            if start_date:
                query = query.filter(StockHistory.date >= start_date)
            if end_date:
                query = query.filter(StockHistory.date <= end_date)

            query = query.order_by(StockHistory.date.desc()).limit(limit)
            results = query.all()

            return [{
                'symbol': r.symbol,
                'date': r.date,
                'open': r.open,
                'high': r.high,
                'low': r.low,
                'close': r.close,
                'volume': r.volume,
                'adjusted_close': r.adjusted_close
            } for r in results]
        finally:
            session.close()

    def delete_stock_data(self, symbol: str, start_date=None, end_date=None):
        """
        Delete stock data from database

        Args:
            symbol: Stock symbol
            start_date: Start date filter
            end_date: End date filter

        Returns:
            Number of records deleted
        """
        session = self.db_manager.get_session()
        try:
            query = session.query(StockHistory).filter_by(symbol=symbol)

            if start_date:
                query = query.filter(StockHistory.date >= start_date)
            if end_date:
                query = query.filter(StockHistory.date <= end_date)

            count = query.delete()
            session.commit()
            print(f"Deleted {count} records for {symbol}")
            return count
        except Exception as e:
            session.rollback()
            print(f"Error deleting data: {e}")
            return 0
        finally:
            session.close()
