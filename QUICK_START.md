# Quick Start Guide

## Problem: Rate Limiting Errors

You encountered this error:
```
Error fetching data for AAPL: Too Many Requests. Rate limited. Try after a while.
```

This is caused by Yahoo Finance's rate limiting. The system has been **enhanced** to handle this.

## Solution Implemented

### 1. Enhanced Retry Logic
- Automatic retries up to 3 times
- Exponential backoff (2s, 4s, 6s)
- Random jitter to avoid synchronized requests

### 2. Rate Limiting Protection
- Configurable delays between requests (default: 2-3s)
- Delays between different stocks (default: 3s)
- You can increase delays with `--delay` flag

### 3. Alternative Data Import Methods
If Yahoo Finance is inaccessible from your network:

#### Option A: Import from CSV
1. Download data manually from Yahoo Finance website
2. Import using: `python import_from_csv.py --file data.csv --symbol AAPL`

#### Option B: Deploy in Different Environment
Deploy on:
- AWS EC2
- Google Cloud
- Azure VM
- Local machine with unrestricted internet

#### Option C: Use Mock Data for Testing
Test database operations: `python test_with_mock_data.py`

## How to Use the Enhanced Version

### Basic Usage (with delays)

```bash
# Single stock with period
python main.py fetch AAPL --period 1mo

# Multiple stocks with 5-second delays
python main.py fetch AAPL MSFT GOOGL --delay 5 --period 3mo

# Specific date range with delays
python main.py fetch AAPL --start 2024-01-01 --end 2024-11-01 --delay 5
```

### Recommended Settings

For **stable operation** in restricted networks:

```bash
# Conservative approach (higher delays)
python main.py fetch AAPL MSFT --delay 10 --period 1mo

# Fetch one at a time with longer periods
python main.py fetch AAPL --period 1y
# Wait a few minutes, then:
python main.py fetch MSFT --period 1y
```

### Import from CSV (if Yahoo Finance blocked)

1. **Download CSV from Yahoo Finance manually:**
   - Go to https://finance.yahoo.com/quote/AAPL/history
   - Select date range
   - Click "Download" to get CSV file

2. **Import to database:**
   ```bash
   python import_from_csv.py --file AAPL.csv --symbol AAPL
   ```

## Testing Without Yahoo Finance

To verify everything else works:

```bash
# Test database connection
python test_connection.py

# Test with mock data (no Yahoo Finance needed)
python test_with_mock_data.py
```

## Network Requirements

### For Yahoo Finance Access
- Unrestricted internet access
- No corporate firewall blocking finance.yahoo.com
- Not behind aggressive rate limiting

### For Database Access
- IP whitelisted in Alibaba RDS security group
- Port 3306 accessible
- DNS resolution working

## Troubleshooting

### Still Getting Rate Limited?

1. **Increase delays more:**
   ```bash
   python main.py fetch AAPL --delay 20 --period 1mo
   ```

2. **Fetch during off-peak hours** (e.g., late night UTC)

3. **Use a VPN** to change your IP address

4. **Wait longer between attempts** (try again in a few hours)

5. **Use CSV import** as a workaround

### Database Connection Failed?

Check:
```bash
# Test DNS
nslookup rm-bp1h4z52g7og7fu03io.mysql.rds.aliyuncs.com

# Test port
nc -zv rm-bp1h4z52g7og7fu03io.mysql.rds.aliyuncs.com 3306

# Run connection test
python test_connection.py
```

If DNS fails, your environment doesn't have access to Alibaba Cloud RDS.
You need to:
- Deploy on a server with access
- Get your IP whitelisted

## Summary

✅ **Fixed**: Added retry logic and rate limiting protection
✅ **Enhanced**: Configurable delays and better error handling
✅ **Added**: CSV import as alternative data source
✅ **Provided**: Mock data for testing without network access
✅ **Documented**: Comprehensive troubleshooting guide

The system is now **much more robust** and can handle rate limiting better.
However, if your network environment blocks Yahoo Finance completely,
you'll need to use the CSV import method or deploy elsewhere.

## Next Steps

1. **Try the enhanced fetcher** with higher delays:
   ```bash
   python main.py fetch AAPL --delay 10 --period 1mo
   ```

2. **If still blocked**, use CSV import method

3. **For production**, deploy on AWS/GCP/Azure instance

4. **Read** [NETWORK_REQUIREMENTS.md](NETWORK_REQUIREMENTS.md) for detailed troubleshooting

## Support

- Check [README.md](README.md) for full documentation
- See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guide
- Review [NETWORK_REQUIREMENTS.md](NETWORK_REQUIREMENTS.md) for network issues
