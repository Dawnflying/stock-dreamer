# Network Requirements and Troubleshooting

## Current Issue

The stock data fetcher is experiencing connectivity issues with Yahoo Finance API. This is typically caused by:

1. **Network Restrictions**: The current environment may have restricted access to Yahoo Finance
2. **Rate Limiting**: Yahoo Finance has implemented strict rate limiting
3. **Geographic Restrictions**: Some regions may have limited access
4. **IP Blocking**: The IP address may be temporarily or permanently blocked

## Error Messages

You may see errors like:
- `HTTP Error 403: Access denied`
- `Too Many Requests. Rate limited. Try after a while`
- `Failed to get ticker 'AAPL' reason: Expecting value: line 1 column 1 (char 0)`

## Solutions

### Solution 1: Use a Proxy or VPN

If you're in a restricted network environment, configure a proxy:

```python
# In stock_fetcher.py, add proxy configuration
import yfinance as yf

proxies = {
    'http': 'http://your-proxy:port',
    'https': 'http://your-proxy:port'
}

# When creating ticker
ticker = yf.Ticker(symbol)
ticker.session.proxies = proxies
```

### Solution 2: Deploy in Different Environment

Deploy the application in an environment with unrestricted internet access:

- AWS EC2 instance
- Google Cloud Compute Engine
- Azure Virtual Machine
- Local machine with direct internet access

### Solution 3: Use Alternative Data Sources

For Chinese stocks (A-shares), the application supports AkShare as a fallback:

```bash
# Install akshare (requires Python environment that supports it)
pip install akshare

# Then use the application normally for Chinese stocks
python main.py fetch 000001.SZ 600000.SS --period 1mo
```

### Solution 4: Import Historical Data from CSV

If you have historical data in CSV format, you can import it directly:

```python
# See import_from_csv.py for a utility to import CSV data
python import_from_csv.py --file your_data.csv
```

### Solution 5: Use Mock Data for Testing

For testing purposes, use the mock data generator:

```python
python test_with_mock_data.py
```

## Network Access Requirements

### Yahoo Finance
- **URL**: `https://query1.finance.yahoo.com/`, `https://query2.finance.yahoo.com/`
- **Protocol**: HTTPS
- **Ports**: 443

### Database (Alibaba Cloud RDS)
- **Host**: `rm-bp1h4z52g7og7fu03io.mysql.rds.aliyuncs.com`
- **Port**: 3306
- **Protocol**: MySQL/TCP
- **Requirements**:
  - IP address must be whitelisted in RDS security group
  - DNS resolution must work
  - Port 3306 must be accessible

## Checking Network Access

### Check Yahoo Finance Access

```bash
# Test with curl
curl -I "https://query1.finance.yahoo.com/v8/finance/chart/AAPL"

# Test with Python
python -c "import requests; print(requests.get('https://finance.yahoo.com').status_code)"
```

### Check Database Access

```bash
# Test DNS resolution
nslookup rm-bp1h4z52g7og7fu03io.mysql.rds.aliyuncs.com

# Test port connectivity
nc -zv rm-bp1h4z52g7og7fu03io.mysql.rds.aliyuncs.com 3306

# Or use telnet
telnet rm-bp1h4z52g7og7fu03io.mysql.rds.aliyuncs.com 3306
```

### Test Database Connection

```bash
python test_connection.py
```

## Recommended Deployment Strategy

1. **Development/Testing**: Use mock data generator
2. **Staging**: Deploy on cloud instance with unrestricted access
3. **Production**:
   - Use cloud instance with whitelisted IP for database
   - Configure proper retry logic and delays
   - Set up monitoring and alerting
   - Consider caching frequently accessed data

## Rate Limiting Best Practices

The application already implements:
- ✓ Delays between requests (2-3 seconds)
- ✓ Exponential backoff on retries
- ✓ Random jitter to avoid synchronized requests
- ✓ Configurable delay between stocks

Additional recommendations:
- Fetch data during off-peak hours
- Use longer periods (1y, 2y) instead of frequent updates
- Cache data locally and only fetch new records
- Consider batch processing overnight

## Support

If issues persist:
1. Check your network firewall settings
2. Verify DNS resolution works
3. Try from a different network
4. Contact your network administrator
5. Consider using alternative data sources

For Yahoo Finance API issues:
- Wait several hours before retrying
- Change your IP address if possible
- Use a residential proxy service
- Consider premium data provider APIs as an alternative
