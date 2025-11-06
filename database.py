"""
Database connection and table management module
"""
import os
from urllib.parse import quote_plus
from sqlalchemy import create_engine, Column, Integer, String, Float, Date, DateTime, Index, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

Base = declarative_base()


class StockHistory(Base):
    """Stock historical data model"""
    __tablename__ = 'stock_history'

    id = Column(Integer, primary_key=True, autoincrement=True)
    symbol = Column(String(20), nullable=False, comment='Stock symbol')
    date = Column(Date, nullable=False, comment='Trading date')
    open = Column(Float, comment='Opening price')
    high = Column(Float, comment='Highest price')
    low = Column(Float, comment='Lowest price')
    close = Column(Float, comment='Closing price')
    volume = Column(Float, comment='Trading volume')
    adjusted_close = Column(Float, comment='Adjusted closing price')
    created_at = Column(DateTime, default=datetime.now, comment='Record creation time')
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now, comment='Record update time')

    # Create composite unique index
    __table_args__ = (
        Index('idx_symbol_date', 'symbol', 'date', unique=True),
        Index('idx_date', 'date'),
        Index('idx_symbol', 'symbol'),
    )


class DatabaseManager:
    """Database connection manager"""

    def __init__(self):
        self.db_host = os.getenv('DB_HOST')
        self.db_port = os.getenv('DB_PORT', '3306')
        self.db_name = os.getenv('DB_NAME')
        self.db_user = os.getenv('DB_USER')
        self.db_password = os.getenv('DB_PASSWORD')

        # URL encode password to handle special characters
        encoded_password = quote_plus(self.db_password) if self.db_password else ''

        # Create database connection string
        self.connection_string = (
            f"mysql+pymysql://{self.db_user}:{encoded_password}@"
            f"{self.db_host}:{self.db_port}/{self.db_name}"
            f"?charset=utf8mb4"
        )

        self.engine = None
        self.Session = None

    def connect(self):
        """Establish database connection"""
        try:
            self.engine = create_engine(
                self.connection_string,
                pool_pre_ping=True,
                pool_recycle=3600,
                echo=False
            )
            self.Session = sessionmaker(bind=self.engine)
            print(f"Successfully connected to database: {self.db_name}")
            return True
        except Exception as e:
            print(f"Failed to connect to database: {e}")
            return False

    def create_tables(self):
        """Create all tables"""
        try:
            Base.metadata.create_all(self.engine)
            print("Database tables created successfully")
            return True
        except Exception as e:
            print(f"Failed to create tables: {e}")
            return False

    def get_session(self):
        """Get database session"""
        if self.Session is None:
            raise Exception("Database not connected. Please call connect() first.")
        return self.Session()

    def test_connection(self):
        """Test database connection"""
        try:
            with self.engine.connect() as conn:
                result = conn.execute(text("SELECT 1"))
                print("Database connection test successful")
                return True
        except Exception as e:
            print(f"Database connection test failed: {e}")
            return False
