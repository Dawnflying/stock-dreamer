#!/usr/bin/env python3
"""
Test database connection and basic functionality
"""
from database import DatabaseManager

def test_connection():
    """Test database connection"""
    print("Testing database connection...")
    print("=" * 60)

    db_manager = DatabaseManager()

    # Test connection
    if db_manager.connect():
        print("✓ Database connection successful")

        # Test actual query
        if db_manager.test_connection():
            print("✓ Database query test successful")

            # Create tables
            if db_manager.create_tables():
                print("✓ Database tables created/verified successfully")
            else:
                print("✗ Failed to create tables")
        else:
            print("✗ Database query test failed")
    else:
        print("✗ Database connection failed")

    print("=" * 60)

if __name__ == '__main__':
    test_connection()
