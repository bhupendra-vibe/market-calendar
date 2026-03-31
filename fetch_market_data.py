"""
Fetch last 30 days of market data and insert into Supabase
Run: python fetch_market_data.py
"""

import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from supabase import create_client
import os

# Supabase credentials
SUPABASE_URL = "https://osesukrvwpfixviawpcd.supabase.co"
SUPABASE_KEY = "sb_publishable_FIlVf7A8E3QKBn-Fr8zLPQ_wHLhe..."  # Replace with your key
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Market symbols
SYMBOLS = {
    'nifty': '^NSEI',
    'banknifty': '^NSEBANK',
    'gold': 'GC=F',
    'silver': 'SI=F',
    'crude': 'CL=F',
    'nasdaq': '^IXIC',
    'sp500': '^GSPC',
    'dji': '^DJI'
}

def calculate_volatility(high, low, open_price):
    """Calculate volatility percentage"""
    if open_price == 0 or pd.isna(open_price):
        return 0
    return ((high - low) / open_price) * 100

def calculate_change(close, open_price):
    """Calculate change percentage"""
    if open_price == 0 or pd.isna(open_price):
        return 0
    return ((close - open_price) / open_price) * 100

def fetch_and_insert_data():
    """Fetch market data and insert into Supabase"""
    
    # Date range: last 30 days
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=30)
    
    print(f"Fetching data from {start_date} to {end_date}...\n")
    
    # Dictionary to store all market data by date
    all_data = {}
    
    for market_name, symbol in SYMBOLS.items():
        try:
            print(f"Fetching {market_name.upper()} ({symbol})...")
            
            # Download data
            data = yf.download(symbol, start=start_date, end=end_date, progress=False)
            
            # Check if data is empty
            if data.empty or len(data) == 0:
                print(f"  ❌ No data found for {market_name}\n")
                continue
            
            # Process each day
            for date, row in data.iterrows():
                date_str = date.strftime('%Y-%m-%d')
                
                open_price = float(row['Open'])
                high_price = float(row['High'])
                low_price = float(row['Low'])
                close_price = float(row['Close'])
                volume = int(row['Volume']) if 'Volume' in row else 0
                
                volatility = calculate_volatility(high_price, low_price, open_price)
                change = calculate_change(close_price, open_price)
                
                # Initialize date entry if not exists
                if date_str not in all_data:
                    all_data[date_str] = {'date': date_str, 'session': 'cash'}
                
                # Add market data
                all_data[date_str][f'{market_name}_open'] = open_price
                all_data[date_str][f'{market_name}_high'] = high_price
                all_data[date_str][f'{market_name}_low'] = low_price
                all_data[date_str][f'{market_name}_close'] = close_price
                all_data[date_str][f'{market_name}_volume'] = volume
                all_data[date_str][f'{market_name}_volatility_percent'] = round(volatility, 2)
                all_data[date_str][f'{market_name}_change_percent'] = round(change, 2)
                
            print(f"  ✓ Fetched {len(data)} records\n")
            
        except Exception as e:
            print(f"  ❌ Error fetching {market_name}: {str(e)}\n")
    
    # Calculate overall_max_volatility for each date
    for date_str, record in all_data.items():
        volatilities = [
            record.get('nifty_volatility_percent', 0),
            record.get('banknifty_volatility_percent', 0),
            record.get('gold_volatility_percent', 0),
            record.get('silver_volatility_percent', 0),
            record.get('crude_volatility_percent', 0),
            record.get('nasdaq_volatility_percent', 0),
            record.get('sp500_volatility_percent', 0),
            record.get('dji_volatility_percent', 0),
        ]
        record['overall_max_volatility'] = round(max(volatilities), 2)
    
    # Insert data into Supabase
    print(f"\nInserting {len(all_data)} records into Supabase...\n")
    
    for date_str, record in all_data.items():
        try:
            response = supabase.table('market_data').upsert(record).execute()
            print(f"  ✓ {date_str} - Max Vol: {record['overall_max_volatility']:.2f}%")
        except Exception as e:
            print(f"  ❌ Error inserting {date_str}: {str(e)}")
    
    print("\n✅ Data insertion complete!")

if __name__ == "__main__":
    fetch_and_insert_data()