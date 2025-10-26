# 🌊 Mizu-Payy - Crypto Payment Platform

**Mizu-Payy** is a comprehensive crypto payment platform built on the Celo blockchain that enables users to make payments using cUSD and CELO tokens and receive instant gift card fulfillment. The platform features a modern web interface, real-time transaction indexing, and automated email notifications.

## 🚀 Features

### Core Payment System
- **Multi-token Support**: Accept payments in cUSD and CELO tokens
- **Real-time Processing**: Instant payment verification and processing
- **Session Management**: Secure payment sessions with unique identifiers
- **Transaction Tracking**: Complete payment history and status tracking

### Gift Card Integration
- **Instant Fulfillment**: Automatic gift card generation and delivery
- **Multiple Providers**: Support for various gift card brands and retailers
- **Smart Matching**: Intelligent gift card selection based on payment amount
- **Inventory Management**: Real-time gift card availability tracking

### User Experience
- **Modern UI**: Beautiful, responsive interface with smooth animations
- **Wallet Integration**: Seamless wallet connection via RainbowKit
- **Authentication**: Secure user authentication with Clerk
- **Dashboard**: Comprehensive user dashboard with payment history

### Email System
- **Payment Confirmations**: Automatic email notifications for successful payments
- **Gift Card Delivery**: Email delivery of gift card codes and details
- **Professional Templates**: Beautiful HTML email templates
- **Multiple Providers**: Support for Gmail SMTP and Resend

### Real-time Indexing
- **Blockchain Monitoring**: Real-time transaction indexing with Envio
- **Live Updates**: Automatic database updates from blockchain events
- **Transaction History**: Complete transaction history with blockchain data
- **Statistics**: Real-time payment statistics and analytics

## 🏗️ Architecture

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **RainbowKit**: Wallet connection interface

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Prisma**: Database ORM with PostgreSQL
- **Clerk**: Authentication and user management
- **Envio**: Blockchain indexing and monitoring

### Blockchain
- **Celo Sepolia Testnet**: Primary blockchain network
- **Smart Contracts**: Custom payment processing contracts
- **Event Indexing**: Real-time blockchain event monitoring

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Celo wallet with testnet tokens
- Clerk account for authentication
- WalletConnect project ID

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone @https://github.com/manovHacksaw/Mizu-Pay/ 
cd Mizu-Payy
```

### 2. Install Dependencies
```bash
npm install
# or
bun install
```

### 3. Environment Setup
Create a `.env` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mizu_pay"

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Email Configuration (Optional)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Mizu Pay

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### 4. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Optional: Run migrations
npm run db:migrate
```

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## 🔗 Smart Contract Addresses

### Celo Sepolia Testnet

| Contract | Address | Description |
|-----------|----------|-------------|
| **MizuPay** | [0x6aE731EbaC64f1E9c6A721eA2775028762830CF7](https://sepolia.celoscan.io/address/0x6aE731EbaC64f1E9c6A721eA2775028762830CF7) | Main payment processing contract |
| **Mock cUSD** | [0x61d11C622Bd98A71aD9361833379A2066Ad29CCa](https://sepolia.celoscan.io/address/0x61d11C622Bd98A71aD9361833379A2066Ad29CCa) | cUSD token contract for testing |


### Network Configuration
- **Chain ID**: 11142220
- **Network Name**: Celo Sepolia Testnet
- **RPC URL**: `https://rpc.ankr.com/celo_sepolia`
- **Block Explorer**: `https://sepolia.celoscan.io`

## 📊 Database Schema

### Core Models

#### User
- User authentication and profile management
- Linked to Clerk authentication system
- Associated with payments and wallets

#### Payment
- Payment transaction records
- Links to gift cards and user sessions
- Tracks payment status and blockchain data

#### GiftCard
- Gift card inventory management
- Tracks usage and availability
- Links to payment transactions

#### IndexedPayment
- Real-time blockchain transaction data
- Populated by Envio indexer
- Includes blockchain-specific metadata

#### Wallet
- User wallet address management
- Primary wallet designation
- Links to user accounts

## 🚀 Deployment

### 1. Build the Application
```bash
npm run build
```

### 2. Start Production Server
```bash
npm start
```

### 3. Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 🔧 API Endpoints

### Payment Endpoints
- `GET /api/payments` - Get payment history
- `POST /api/payments` - Create new payment
- `GET /api/payments/latest` - Get latest payments
- `POST /api/payments/verify` - Verify payment status

### Gift Card Endpoints
- `GET /api/gift-cards` - Get available gift cards
- `GET /api/gift-cards/all` - Get all gift cards
- `POST /api/gift-cards` - Reserve gift card

### Transaction Endpoints
- `GET /api/transactions/latest` - Get latest transactions
- `GET /api/transactions/stats` - Get transaction statistics
- `GET /api/transactions/payments` - Get payment transactions

### Email Endpoints
- `POST /api/send-email` - Send payment confirmation email
- `POST /api/send-gift-card-email` - Send gift card email

## 🔄 Real-time Indexing

### Setup Envio Indexer
```bash
# Install Envio CLI
npm i -g @envio/cli@latest

# Start indexer in development
npm run indexer:dev

# Start indexer in production
npm run indexer:start
```

### Indexer Features
- **Real-time Monitoring**: Tracks all contract events
- **Automatic Updates**: Updates database with new transactions
- **Event Processing**: Processes PaymentReceived and Withdrawn events
- **Statistics**: Maintains real-time payment statistics

## 📧 Email System

### Configuration Options

#### Option 1: Gmail SMTP (Free)
```env
# Uses Gmail SMTP with app password
# Configured in lib/email-service.ts
```

#### Option 2: Resend (Recommended)
```env
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
```

### Email Templates
- **Payment Confirmation**: Sent after successful payment
- **Gift Card Delivery**: Contains gift card codes and details
- **Professional Design**: Beautiful HTML templates with branding

## 🎯 Usage

### Making a Payment
1. Connect your wallet using RainbowKit
2. Navigate to the payment page
3. Enter payment details (amount, store, product)
4. Select payment token (cUSD or CELO)
5. Confirm transaction in your wallet
6. Receive email confirmation and gift card

### Dashboard Features
- View payment history
- Track transaction status
- Monitor gift card deliveries
- Access wallet management

### Admin Features
- View all transactions
- Monitor system statistics
- Manage gift card inventory
- Access real-time analytics

## 🧪 Testing

### Test Gift Cards
```bash
# Seed test gift cards
npm run seed-gift-cards

# Test gift card API
npm run test-gift-cards-api
```

### Database Testing
```bash
# Test database connection
npm run test-db-connection
```

## 📱 Browser Extension

The project includes a Celo browser extension for enhanced wallet functionality:

- **Location**: `celo-extension/`
- **Features**: Wallet management, transaction signing
- **Installation**: Load as unpacked extension in Chrome/Edge

## 🔒 Security

- **Authentication**: Secure user authentication with Clerk
- **Wallet Security**: Non-custodial wallet integration
- **Database Security**: Prisma ORM with parameterized queries
- **Email Security**: Secure email delivery with authentication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `docs/` folder
- Review the setup guides for specific components

## 🔮 Roadmap

- [ ] Mainnet deployment
- [ ] Additional payment tokens
- [ ] Enhanced gift card providers
- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

---

**Built with ❤️ on the Celo blockchain**
