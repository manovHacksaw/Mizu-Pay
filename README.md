# Mizu Pay 💧

**Transform your crypto into real purchases on any e-commerce site**

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/manovHacksaw/Mizu-Pay)

Mizu Pay is a revolutionary payment platform that enables users to spend their cryptocurrency (cUSD and CELO) on any online store by converting crypto payments into gift cards. Built on the Celo blockchain, Mizu Pay bridges the gap between digital assets and real-world commerce, making crypto truly spendable.

---

## 🎯 Problem Statement

### The Crypto Spending Problem

Despite the growing adoption of cryptocurrencies, there remains a significant barrier between holding digital assets and using them for everyday purchases:

1. **Limited Acceptance**: Most e-commerce platforms don't directly accept cryptocurrency payments
2. **Complex Conversion**: Converting crypto to fiat requires multiple steps, exchanges, and often involves high fees
3. **Geographic Restrictions**: Traditional payment methods are often limited by geographic boundaries
4. **Trust & Security Concerns**: Users are hesitant to share sensitive financial information online
5. **Slow Transaction Times**: Traditional payment systems can take days to process

### The Opportunity

Millions of users hold cryptocurrency but struggle to use it for real-world purchases. Gift cards represent a universal payment method accepted by virtually every major e-commerce platform, making them the perfect bridge between crypto and commerce.

---

## 🔗 Smart Contracts (Celo Sepolia Testnet)

### Contract Addresses

#### MizuPay Contract
- **Address**: `0x18042d3C48d7f09E863A5e18Ef3562E4827638aA`
- **Explorer**: [View on Blockscout](https://celo-sepolia.blockscout.com/address/0x18042d3C48d7f09E863A5e18Ef3562E4827638aA)
- **Network**: Celo Sepolia Testnet
- **Chain ID**: 11142220

#### MockCUSD Contract
- **Address**: `0x967DBe52B9b4133B18A91bDC4F800063D205704A`
- **Explorer**: [View on Blockscout](https://celo-sepolia.blockscout.com/address/0x967DBe52B9b4133B18A91bDC4F800063D205704A)
- **Network**: Celo Sepolia Testnet
- **Chain ID**: 11142220

### Contract Functions

#### MizuPay Contract
- `payForSession(string sessionId, uint256 amount)` - Pay for a payment session
- `getPaymentInfo(string sessionId)` - Retrieve payment details for a session
- `getBalance()` - Get contract's cUSD balance
- `withdraw(address to, uint256 amount)` - Withdraw funds (owner only)
- `setCusdToken(address _newToken)` - Update token address (owner only)

**Events:**
- `PaymentReceived(string indexed sessionId, address indexed payer, uint256 amount, uint256 timestamp)`
- `PaymentWithdrawn(address indexed to, uint256 amount, uint256 timestamp)`

#### MockCUSD Contract
- `mint(address _to, uint256 _amount)` - Mint tokens (owner only)
- `transfer(address _to, uint256 _value)` - Transfer tokens
- `approve(address _spender, uint256 _value)` - Approve spending
- `transferFrom(address _from, address _to, uint256 _value)` - Transfer on behalf
- `balanceOf(address account)` - Get token balance

**Events:**
- `Transfer(address indexed from, address indexed to, uint256 value)`
- `Approval(address indexed owner, address indexed spender, uint256 value)`

### Network Configuration
- **RPC URL**: `https://rpc.ankr.com/celo_sepolia`
- **Block Explorer**: `https://celo-sepolia.blockscout.com`
- **Native Currency**: CELO (18 decimals)
- **Test Token**: MockCUSD (18 decimals)

---


## 💡 Solution

Mizu Pay solves this problem by creating a seamless, secure, and instant bridge between cryptocurrency and e-commerce:

### Core Innovation

1. **Browser Extension Integration**: Detects checkout pages on any e-commerce site and offers "Pay with Mizu Pay" as a payment option
2. **Smart Gift Card Matching**: Automatically finds and matches available gift cards that meet or exceed the purchase amount
3. **Blockchain-Powered Payments**: Secure, transparent payments using smart contracts on the Celo network
4. **Instant Delivery**: Gift cards are delivered via email immediately after payment confirmation
5. **No KYC Required**: Wallet-based authentication eliminates the need for traditional sign-ups and identity verification

### How It Works

```
User browses e-commerce site → Extension detects checkout → 
User clicks "Pay with Mizu Pay" → Selects gift card → 
Connects wallet → Pays with cUSD/CELO → 
Receives gift card via email → Uses gift card to complete purchase
```

---

## ✨ Key Features

### 1. **Universal E-commerce Compatibility**
- Works on any website that accepts gift cards
- Browser extension automatically detects checkout pages
- No integration required from merchants
- Supports major retailers (Amazon, Flipkart, Myntra, MakeMyTrip, and more)

### 2. **Smart Gift Card Management**
- **Automatic Matching**: System finds the best available gift card that meets or exceeds purchase amount
- **Multi-Currency Support**: Handles USD, INR, and other currencies with real-time exchange rates
- **Inventory Management**: Secure, encrypted storage of gift card details
- **Overpayment Handling**: If gift card value exceeds purchase amount, user pays the exact gift card value

### 3. **Secure Blockchain Payments**
- **Smart Contract Integration**: All payments processed through auditable smart contracts
- **Two-Phase Fulfillment**: Payment confirmation → Gift card delivery (prevents double-spending)
- **Transaction Transparency**: All payments recorded on-chain with transaction hashes
- **Wallet Flexibility**: Support for both embedded (Privy) and external wallets (MetaMask, etc.)

### 4. **User Experience**
- **Dashboard**: Comprehensive transaction history, wallet management, and analytics
- **Real-Time Status Tracking**: Monitor payment progress from pending → paid → fulfilled
- **Email Notifications**: Instant delivery of gift card details via encrypted email
- **Export Capabilities**: Download transaction history as CSV for accounting

### 5. **Developer-Friendly Architecture**
- **Next.js 16**: Modern React framework with App Router
- **TypeScript**: Full type safety across the application
- **Prisma ORM**: Type-safe database access with PostgreSQL
- **Privy Integration**: Seamless wallet authentication and management
- **RESTful API**: Well-structured API endpoints for all operations

---

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 16 with TypeScript
- **UI Components**: Radix UI primitives with custom styling
- **State Management**: Zustand for global state
- **Wallet Integration**: Privy for embedded wallets, viem for blockchain interactions
- **Styling**: Tailwind CSS with custom theme system

### Backend
- **API Routes**: Next.js API routes for serverless functions
- **Database**: PostgreSQL with Prisma ORM
- **Email Service**: Nodemailer/Resend for gift card delivery
- **Payment Verification**: On-chain transaction monitoring and confirmation

### Smart Contracts
- **Network**: Celo Sepolia Testnet
- **Contracts**: 
  - **MizuPay**: Main payment receiver contract
  - **MockCUSD**: ERC20-compatible test token
- **Language**: Solidity 0.8.20
- **Security**: OpenZeppelin contracts for ownership and token standards

### Browser Extension
- **Manifest V3**: Modern Chrome extension architecture
- **Content Scripts**: Detects checkout pages and injects payment button
- **Background Service**: Handles extension logic and communication

---


## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL database
- Celo Sepolia testnet access (for testing)
- Privy account (for wallet integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/manovHacksaw/Mizu-Pay.git
   cd Mizu-Pay
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/mizu_pay"
   PRIVY_APP_ID="your_privy_app_id"
   PRIVY_APP_SECRET="your_privy_app_secret"
   NEXTAUTH_SECRET="your_nextauth_secret"
   EMAIL_HOST="smtp.example.com"
   EMAIL_USER="your_email@example.com"
   EMAIL_PASS="your_email_password"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   bun prisma/seed.ts  # Seed gift cards
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Loading the Browser Extension

1. Open Chrome/Edge and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/` directory from this project
5. The extension icon should appear in your browser toolbar

---

## 📁 Project Structure

```
mizu-pay/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── checkout/          # Checkout pages
│   ├── dashboard/         # User dashboard
│   └── login/             # Authentication
├── components/            # React components
│   ├── dashboard/        # Dashboard-specific components
│   ├── ui/               # Reusable UI components
│   └── sections/         # Landing page sections
├── contracts/            # Smart contracts
│   ├── MizuPay.sol       # Main payment contract
│   └── MockCUSD.sol      # Test token contract
├── extension/            # Browser extension
├── lib/                  # Utility functions
│   ├── abis/            # Contract ABIs
│   ├── contracts.ts     # Contract addresses
│   └── ...              # Other utilities
├── prisma/              # Database schema and migrations
└── public/              # Static assets
```

---

## 🔄 Payment Flow

### 1. Session Creation
- User clicks "Pay with Mizu Pay" on checkout page
- Extension sends store, amount, and currency to backend
- Backend creates a `PaymentSession` with status `pending`

### 2. Gift Card Selection
- System finds available gift cards matching the purchase
- User selects a gift card (or system auto-selects best match)
- Gift card is reserved for the session

### 3. Wallet Connection
- User connects embedded or external wallet
- System verifies wallet balance and network (Celo Sepolia)

### 4. Payment Execution
- User approves cUSD spending for MizuPay contract
- User pays for session via `payForSession()` smart contract call
- Transaction is broadcast to blockchain

### 5. Payment Confirmation
- Backend monitors transaction status
- Once confirmed, session status updates to `paid`
- Payment record is created with transaction hash

### 6. Gift Card Fulfillment
- Gift card details are decrypted
- Email is sent to user with gift card information
- Session status updates to `fulfilled`
- Gift card is marked as consumed

---

## 🛡️ Security Features

- **Encrypted Gift Cards**: All gift card details stored with AES-256 encryption
- **Two-Phase Fulfillment**: Prevents double-spending and ensures payment before delivery
- **Smart Contract Security**: OpenZeppelin audited contracts
- **Transaction Verification**: On-chain verification of all payments
- **Session Expiration**: Automatic expiration of unpaid sessions
- **Rate Limiting**: API endpoints protected against abuse

---

## 🧪 Testing

### Smart Contract Testing
1. Deploy contracts to Celo Sepolia (see `contracts/README.md`)
2. Mint test tokens using MockCUSD contract
3. Test payment flow using Remix IDE or Hardhat

### Application Testing
1. Create test gift cards using seed script
2. Test checkout flow with browser extension
3. Verify email delivery
4. Check transaction history in dashboard

---

## 📊 Database Schema

### Key Models
- **User**: Email, active wallet, authentication
- **Wallet**: Address, type (embedded/external)
- **PaymentSession**: Store, amount, status, expiration
- **Payment**: Transaction hash, amount, token, status
- **GiftCard**: Encrypted details, store, currency, amount

See `prisma/schema.prisma` for complete schema definition.

---

## 🔧 API Endpoints

### Sessions
- `POST /api/sessions/create` - Create payment session
- `GET /api/sessions/[sessionId]` - Get session details

### Payments
- `POST /api/payments/create` - Create payment record
- `GET /api/payments/history` - Get user payment history
- `POST /api/payments/verify-progress` - Verify payment status

### Gift Cards
- `GET /api/gift-cards/options` - Find available gift cards

### Exchange Rates
- `GET /api/exchange-rates` - Get current exchange rates
- `GET /api/exchange-rate/usd-inr` - Get USD to INR rate

---

## 🌐 Browser Extension

The browser extension enables Mizu Pay to work on any e-commerce site:

1. **Detection**: Automatically detects checkout pages
2. **Injection**: Injects "Pay with Mizu Pay" button
3. **Communication**: Sends checkout details to dApp
4. **Seamless UX**: Opens dApp in new tab with pre-filled data

---

## 👥 Contributors

This project is made possible by the contributions of:

- **[manovHacksaw](https://github.com/manovHacksaw)** - Project maintainer and lead developer
- **[Anuska Sarkar](https://github.com/Anuskawebb)** - Contributor and Web3 developer

We're grateful for all contributions, big and small! 🎉

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🔮 Future Enhancements

- [ ] Multi-chain support (beyond Celo)
- [ ] Additional gift card providers
- [ ] Mobile app support
- [ ] Recurring payments/subscriptions
- [ ] Merchant integration API
- [ ] Loyalty program integration
- [ ] Support for more cryptocurrencies

---

## 📞 Support

For issues, questions, or contributions, please open an issue on the [GitHub repository](https://github.com/manovHacksaw/Mizu-Pay/issues).

---

## 🙏 Acknowledgments

- Built on [Celo](https://celo.org/) blockchain
- Powered by [Privy](https://privy.io/) for wallet management
- UI components from [Radix UI](https://www.radix-ui.com/)
- Smart contracts use [OpenZeppelin](https://openzeppelin.com/) libraries

---

**Made with ❤️ for the crypto community**
