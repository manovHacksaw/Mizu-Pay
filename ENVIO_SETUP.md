# Envio Indexer Setup for MizuPay

This guide will help you set up the Envio indexer to track transactions from your MizuPay contract on Celo Testnet.

## Prerequisites

1. **Install Envio CLI** (v0.0.21):
```bash
npm i -g envio@v0.0.21
```

2. **Install project dependencies**:
```bash
npm install
```

3. **Set up your database** (PostgreSQL required):
```bash
# Update your DATABASE_URL in .env
DATABASE_URL="postgresql://username:password@localhost:5432/mizu_pay"

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push
```

## Contract Information

- **Contract Address**: `0x6aE731EbaC64f1E9c6A721eA2775028762830CF7`
- **Network**: Celo Sepolia Testnet (Chain ID: 11142220)
- **RPC URL**: `https://rpc.ankr.com/celo_sepolia`
- **Block Explorer**: `https://sepolia.celoscan.io`

## Events Being Indexed

1. **PaymentReceived**: Tracks all payments made to the contract
   - `payer`: Address of the person making the payment
   - `amount`: Payment amount
   - `currency`: Currency used (CUSD/CELO)
   - `sessionId`: Unique session identifier
   - `timestamp`: Block timestamp

2. **Withdrawn**: Tracks all withdrawals from the contract
   - `to`: Address receiving the withdrawal
   - `amount`: Withdrawal amount
   - `currency`: Currency withdrawn
   - `timestamp`: Block timestamp

## Running the Indexer

### Development Mode
```bash
npm run indexer:dev
```

### Production Mode
```bash
# Build the indexer
npm run indexer:build

# Start the indexer
npm run indexer:start
```

## Database Schema

The indexer will create the following tables:

- `IndexedPayment`: Stores all payment transactions
- `IndexedWithdrawal`: Stores all withdrawal transactions  
- `IndexedUser`: Tracks user statistics
- `GlobalStats`: Global contract statistics

## Viewing Transactions

Once the indexer is running, you can view the indexed transactions at:
- **URL**: `http://localhost:3000/transactions`
- **Features**:
  - Real-time transaction display
  - Search and filtering
  - Statistics dashboard
  - Direct links to CeloScan explorer

## Configuration

The indexer configuration is in `envio.yaml`:

```yaml
name: MizuPayIndexer
description: Indexer for MizuPay contract on Celo Testnet
contracts:
  - name: MizuPay
    abi: ./lib/abi/MizuPay.json
    networks:
      - id: 11142220 # Celo Sepolia Testnet
        start_block: 0 # Start from genesis
        contracts:
          - name: MizuPay
            address: "0x6aE731EbaC64f1E9c6A721eA2775028762830CF7"
            handler: ./src/EventHandlers.ts
            events:
              - event: "PaymentReceived(address indexed payer, uint256 amount, string currency, string sessionId, uint256 timestamp)"
              - event: "Withdrawn(address indexed to, uint256 amount, string currency, uint256 timestamp)"
```

## Troubleshooting

1. **Indexer not starting**: Check that your database is running and accessible
2. **No transactions showing**: Verify the contract address and network configuration
3. **Database errors**: Run `npm run db:push` to update the schema

## Next Steps

1. Start the indexer in development mode
2. Make some test transactions on your contract
3. Check the `/transactions` page to see indexed data
4. Monitor the indexer logs for any issues

For more information, refer to the [Envio documentation](https://docs.envio.dev).
