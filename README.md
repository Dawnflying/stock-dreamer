# Stock Dreamer

Stock Dreamer is a Python-based application for fetching historical stock data from public data sources and storing it in a MySQL database.

## Features

- Fetch historical stock data from Yahoo Finance
- Support for multiple stock markets (US, HK, SH, SZ)
- Store data in MySQL database with automatic duplicate handling
- Query stored data from the database
- Command-line interface for easy operation

## Installation

### Prerequisites

- Python 3.8 or higher
- MySQL database

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd stock-dreamer
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure database connection:
```bash
cp .env.example .env
# Edit .env file with your database credentials
```

## Database Configuration

Edit the `.env` file with your database credentials:

```
DB_HOST=your-database-host
DB_PORT=3306
DB_NAME=stock_dreamer
DB_USER=your-username
DB_PASSWORD=your-password
```

## Usage

### Fetch Stock Data

Fetch data for one or more stocks:

```bash
# Fetch last month's data for Apple
python main.py fetch AAPL

# Fetch data for multiple stocks
python main.py fetch AAPL MSFT GOOGL

# Fetch data with specific date range
python main.py fetch AAPL --start 2024-01-01 --end 2024-12-31

# Fetch data with period
python main.py fetch AAPL --period 1y

# Fetch without updating existing records
python main.py fetch AAPL --no-update
```

### Supported Periods

- `1d` - 1 day
- `5d` - 5 days
- `1mo` - 1 month (default)
- `3mo` - 3 months
- `6mo` - 6 months
- `1y` - 1 year
- `2y` - 2 years
- `5y` - 5 years
- `max` - Maximum available data

### Stock Symbol Format

- **US stocks**: Use the ticker symbol directly (e.g., `AAPL`, `MSFT`, `GOOGL`)
- **Hong Kong stocks**: Add `.HK` suffix (e.g., `0700.HK`)
- **Shanghai stocks**: Add `.SS` suffix (e.g., `600000.SS`)
- **Shenzhen stocks**: Add `.SZ` suffix (e.g., `000001.SZ`)

### Query Stock Data

Query data from the database:

```bash
# Query last 10 records for Apple
python main.py query AAPL

# Query with date range
python main.py query AAPL --start 2024-01-01 --end 2024-12-31

# Query with limit
python main.py query AAPL --limit 50
```

## Database Schema

The application creates a `stock_history` table with the following structure:

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| symbol | String(20) | Stock symbol |
| date | Date | Trading date |
| open | Float | Opening price |
| high | Float | Highest price |
| low | Float | Lowest price |
| close | Float | Closing price |
| volume | Float | Trading volume |
| adjusted_close | Float | Adjusted closing price |
| created_at | DateTime | Record creation time |
| updated_at | DateTime | Record update time |

### Indexes

- Unique composite index on (symbol, date)
- Index on date
- Index on symbol

## Project Structure

```
stock-dreamer/
├── .env                      # Environment configuration
├── .env.example              # Example environment configuration
├── .gitignore                # Git ignore file
├── requirements.txt          # Python dependencies
├── README.md                 # This file
├── DEPLOYMENT.md             # Deployment guide
├── NETWORK_REQUIREMENTS.md   # Network troubleshooting guide
├── database.py               # Database connection and models
├── stock_fetcher.py          # Stock data fetching logic (with retry)
├── data_storage.py           # Data storage logic
├── main.py                   # Main application script
├── example_usage.py          # Usage examples
├── import_from_csv.py        # CSV import utility
├── test_connection.py        # Database connection test
├── test_new_fetcher.py       # Data fetching test
└── test_with_mock_data.py    # Mock data testing
```

## Modules

### database.py
Handles database connection and defines the data model using SQLAlchemy ORM.

### stock_fetcher.py
Fetches stock data from Yahoo Finance using the yfinance library.

### data_storage.py
Manages data persistence to the MySQL database.

### main.py
Command-line interface and main application logic.

## Examples

### Example 1: Fetch Recent Data for Tech Stocks

```bash
python main.py fetch AAPL MSFT GOOGL AMZN META --period 3mo
```

### Example 2: Fetch Historical Data for Chinese Stocks

```bash
python main.py fetch 600000.SS 000001.SZ 0700.HK --start 2024-01-01 --end 2024-12-31
```

### Example 3: Query and View Data

```bash
python main.py query AAPL --limit 20
```

### Example 4: Configure Delays to Avoid Rate Limiting

```bash
# Increase delay between stocks to 5 seconds
python main.py fetch AAPL MSFT GOOGL --delay 5 --period 1mo
```

### Example 5: Import Data from CSV

```bash
# Import historical data from a CSV file
python import_from_csv.py --file stock_data.csv --symbol AAPL
```

## Features

### Robust Data Fetching
- **Automatic retry logic** with exponential backoff (up to 3 attempts)
- **Rate limiting protection** with configurable delays between requests
- **Random jitter** to avoid synchronized requests
- **Multiple data sources** support (yfinance primary, with fallback options)

### Intelligent Error Handling
- Automatic duplicate record detection (updates existing records by default)
- Network errors are caught and logged with detailed messages
- Invalid symbols are skipped with warning messages
- Database connection failures are reported with troubleshooting hints
- Graceful degradation when data sources are unavailable

### Flexible Configuration
- Configurable delays between stock fetches (default: 3 seconds)
- Adjustable retry attempts and timeout settings
- Support for date ranges or relative periods
- Option to skip updating existing records

## Troubleshooting

### Rate Limiting / Access Denied Errors

If you encounter errors like `HTTP Error 403` or `Too Many Requests`:

1. **Increase delays**: Use `--delay 5` or higher
2. **Use a VPN or proxy**: Some networks restrict access to Yahoo Finance
3. **Deploy in different environment**: AWS, GCP, or Azure instances typically work
4. **Test with mock data**: Run `python test_with_mock_data.py` to verify everything else works

See [NETWORK_REQUIREMENTS.md](NETWORK_REQUIREMENTS.md) for detailed troubleshooting.

### Database Connection Issues

If you can't connect to the database:

1. Check your `.env` file has correct credentials
2. Verify your IP is whitelisted in RDS security group
3. Test DNS resolution: `nslookup rm-bp1h4z52g7og7fu03io.mysql.rds.aliyuncs.com`
4. Run `python test_connection.py` for diagnostic information

### Testing Without Network Access

For testing the database operations without Yahoo Finance access:

```bash
# Test with mock data
python test_with_mock_data.py

# Import from CSV
python import_from_csv.py --file your_data.csv --symbol AAPL
```

## Alternative Usage Methods

### Import from CSV

If you have historical data in CSV format (e.g., downloaded from Yahoo Finance manually):

```bash
python import_from_csv.py --file stock_data.csv --symbol AAPL
```

CSV format should be:
```csv
Date,Open,High,Low,Close,Volume,Adj Close
2024-01-01,150.0,152.0,149.0,151.0,1000000,151.0
```

### Testing with Mock Data

To test database operations without network access:

```bash
python test_with_mock_data.py
```

This generates synthetic stock data and tests all database operations.

## Dependencies

- **yfinance**: Fetch stock data from Yahoo Finance
- **pymysql**: MySQL database driver
- **pandas**: Data manipulation
- **sqlalchemy**: Database ORM
- **python-dotenv**: Environment variable management
- **cryptography**: Required for SSL connections
- **retry**: Retry logic for failed requests
- **requests**: HTTP library

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License.
