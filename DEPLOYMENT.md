# Deployment Notes

## Network Requirements

This application requires:

1. **Internet access** to fetch stock data from Yahoo Finance
2. **Database connectivity** to the MySQL RDS instance

### Database Connection

The application connects to an Alibaba Cloud RDS MySQL instance. Please ensure:

- Your server/container has network connectivity to: `rm-bp1h4z52g7og7fu03io.mysql.rds.aliyuncs.com`
- The IP address of your server is whitelisted in the RDS security group
- Proper DNS resolution is configured
- Port 3306 is accessible

### Yahoo Finance Access

The stock data fetcher uses Yahoo Finance API which may have rate limits or regional restrictions. If you encounter 403 errors:

1. The application includes User-Agent headers to avoid basic blocking
2. Consider using a proxy if accessing from restricted regions
3. Alternative data sources can be integrated if needed

## Testing

### Test Database Connection

```bash
python test_connection.py
```

This will verify:
- Database credentials are correct
- Network connectivity to RDS
- Table creation permissions

### Test Data Fetching (No Database)

```bash
python test_fetcher_only.py
```

This tests the stock data fetching functionality without requiring database access.

## Deployment Steps

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Test Connection**
   ```bash
   python test_connection.py
   ```

4. **Initialize Database**
   The application will automatically create tables on first run.

5. **Fetch Data**
   ```bash
   # Fetch data for specific stocks
   python main.py fetch AAPL MSFT GOOGL --period 1mo
   ```

## Troubleshooting

### Database Connection Issues

**Error: "Can't connect to MySQL server"**
- Check RDS security group allows your IP
- Verify database credentials in .env
- Test DNS resolution: `nslookup rm-bp1h4z52g7og7fu03io.mysql.rds.aliyuncs.com`
- Ensure port 3306 is not blocked by firewall

**Error: "Access denied for user"**
- Verify username and password in .env
- Check user has proper permissions: SELECT, INSERT, UPDATE, CREATE

### Yahoo Finance Issues

**Error: "HTTP Error 403: Access denied"**
- This may occur in certain network environments
- The application includes User-Agent headers by default
- Consider using a proxy or VPN if accessing from restricted regions

**Error: "No data found for symbol"**
- Verify the stock symbol is correct
- Check if the stock market is open or if there's recent trading data
- Try different time periods

## Production Recommendations

1. **Use a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Set up logging**
   Consider adding proper logging to a file for production monitoring

3. **Schedule regular updates**
   Use cron (Linux) or Task Scheduler (Windows) to run data fetches regularly:
   ```bash
   # Example cron entry (daily at 6 PM)
   0 18 * * * cd /path/to/stock-dreamer && /path/to/venv/bin/python main.py fetch AAPL MSFT GOOGL
   ```

4. **Monitor database size**
   Stock historical data can grow large over time. Consider:
   - Regular cleanup of old data if not needed
   - Database backups
   - Index optimization

5. **Error handling**
   The application includes error handling, but consider:
   - Email/SMS alerts for failures
   - Retry logic for transient network issues
   - Monitoring dashboard

## Security Notes

- Never commit .env file to version control (it's in .gitignore)
- Rotate database credentials regularly
- Use read-only database user if only querying data
- Consider encrypting sensitive configuration
