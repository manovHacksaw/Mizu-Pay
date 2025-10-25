# Real Envio Indexer Setup for MizuPay

This guide will help you set up the **real** Envio indexer to track actual transactions from your MizuPay contract on Celo Testnet.

## 🎯 What You'll Get

- **Real-time transaction indexing** from your smart contract
- **Live transaction data** displayed on the transactions page
- **Automatic updates** every 30 seconds
- **Real statistics** from actual blockchain data

## 📋 Prerequisites

1. **Node.js** and **npm** installed
2. **PostgreSQL database** (your existing Supabase database works)
3. **Contract deployed** on Celo Sepolia Testnet

## 🚀 Quick Setup

### Step 1: Install Envio CLI
```bash
npm i -g @envio/cli@latest
```

### Step 2: Run the Setup Script
```powershell
# On Windows
.\scripts\setup-envio-real.ps1

# Or manually:
bun install
npx prisma generate
npx prisma db push
```

### Step 3: Start the Indexer
```bash
# Start the indexer in development mode
envio indexer dev

# Or in production mode
envio indexer start
```

### Step 4: View Real Transactions
- Visit `http://localhost:3000/transactions`
- You'll see real transaction data from your contract
- Data updates automatically every 30 seconds

## 🔧 Configuration Details

### Contract Information
- **Address**: `0x6aE731EbaC64f1E9c6A721eA2775028762830CF7`
- **Network**: Celo Sepolia Testnet (Chain ID: 11142220)
- **RPC**: `https://rpc.ankr.com/celo_sepolia`
- **Explorer**: `https://sepolia.celoscan.io`

### Events Being Indexed
1. **PaymentReceived**: All payments to the contract
   - `payer`: Who made the payment
   - `amount`: Payment amount
   - `currency`: CUSD/CELO
   - `sessionId`: Unique session identifier
   - `timestamp`: Block timestamp

2. **Withdrawn**: All withdrawals from the contract
   - `to`: Who received the withdrawal
   - `amount`: Withdrawal amount
   - `currency`: CUSD/CELO
   - `timestamp`: Block timestamp

## 📊 What You'll See

### Real-time Dashboard
- **Live transaction feed** with actual blockchain data
- **Statistics** calculated from real transactions
- **Search and filtering** of real transaction data
- **Direct links** to CeloScan explorer

### Automatic Updates
- **Polling**: Updates every 30 seconds
- **Real-time**: New transactions appear automatically
- **Statistics**: Global stats update in real-time

## 🧪 Testing the Indexer

### 1. Make Test Transactions
- Use your payment page to make test payments
- Each payment will be indexed automatically
- Withdrawals will also be tracked

### 2. Check the Dashboard
- Visit `/transactions` to see your real data
- Watch the statistics update in real-time
- Use search and filters on real data

### 3. Verify on Explorer
- Click "View on Explorer" to see transactions on CeloScan
- Verify the data matches what you see in the dashboard

## 🔍 Monitoring

### Indexer Status
- **Green dot**: Indexer is active and has data
- **Yellow dot**: Indexer is running but no transactions yet
- **Red dot**: Indexer is not running

### Database Tables
The indexer creates these tables:
- `IndexedPayment`: All payment transactions
- `IndexedWithdrawal`: All withdrawal transactions
- `IndexedUser`: User statistics
- `GlobalStats`: Global contract statistics

## 🚨 Troubleshooting

### Indexer Not Starting
```bash
# Check if Envio CLI is installed
envio --version

# Reinstall if needed
npm i -g @envio/cli@latest
```

### No Data Showing
1. **Check contract address** in `envio.yaml`
2. **Verify network connection** to Celo Sepolia
3. **Make test transactions** to generate data
4. **Check indexer logs** for errors

### Database Issues
```bash
# Reset database schema
npx prisma db push --force-reset

# Regenerate Prisma client
npx prisma generate
```

## 📈 Performance

### Indexing Speed
- **New transactions**: Indexed within 1-2 blocks
- **Historical data**: Backfilled from contract deployment
- **Update frequency**: Every 30 seconds

### Data Storage
- **Efficient storage**: Only essential transaction data
- **Optimized queries**: Fast search and filtering
- **Real-time updates**: Live dashboard refresh

## 🎉 Success!

Once everything is running:

1. **Visit** `http://localhost:3000/transactions`
2. **Make** some test payments on your contract
3. **Watch** the transactions appear in real-time
4. **Explore** the search and filtering features
5. **Check** the statistics dashboard

You now have a **real-time blockchain transaction indexer** for your MizuPay contract! 🚀

## 📞 Support

If you encounter issues:
1. Check the indexer logs for errors
2. Verify your contract address and network
3. Ensure your database is accessible
4. Make sure you have test transactions to index

The indexer will automatically start tracking all new transactions from your contract! 🎯
