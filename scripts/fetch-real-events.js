const { PrismaClient } = require('@prisma/client')
const { createPublicClient, http, parseAbi } = require('viem')
const { celo } = require('viem/chains')

const prisma = new PrismaClient()

// Your contract details
const CONTRACT_ADDRESS = '0x6aE731EbaC64f1E9c6A721eA2775028762830CF7'
const RPC_URL = 'https://rpc.ankr.com/celo_sepolia'

// Contract ABI for the events we want to track
const CONTRACT_ABI = parseAbi([
  'event PaymentReceived(address indexed payer, uint256 amount, string currency, string sessionId, uint256 timestamp)',
  'event Withdrawn(address indexed to, uint256 amount, string currency, uint256 timestamp)'
])

// Create Celo Sepolia chain config
const celoSepolia = {
  id: 11142220,
  name: 'CELO Sepolia Testnet',
  network: 'celo-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: { http: [RPC_URL] },
    public: { http: [RPC_URL] },
  },
  blockExplorers: {
    default: { name: 'CeloScan', url: 'https://sepolia.celoscan.io' },
  },
  testnet: true,
}

const client = createPublicClient({
  chain: celoSepolia,
  transport: http(RPC_URL)
})

async function fetchRealEvents() {
  console.log('🔍 Fetching REAL events from your contract...')
  console.log(`📋 Contract: ${CONTRACT_ADDRESS}`)
  console.log(`🌐 Network: Celo Sepolia Testnet`)

  try {
    // Get the latest block number
    const latestBlock = await client.getBlockNumber()
    console.log(`📦 Latest block: ${latestBlock}`)

    // Start from a reasonable block (let's go back 1000 blocks to catch recent events)
    const fromBlock = latestBlock - 1000n
    const toBlock = latestBlock

    console.log(`🔍 Scanning blocks ${fromBlock} to ${toBlock}`)

    // Fetch PaymentReceived events
    console.log('💰 Fetching PaymentReceived events...')
    const paymentEvents = await client.getLogs({
      address: CONTRACT_ADDRESS,
      event: CONTRACT_ABI[0], // PaymentReceived
      fromBlock,
      toBlock
    })

    console.log(`✅ Found ${paymentEvents.length} PaymentReceived events`)

    // Fetch Withdrawn events
    console.log('💸 Fetching Withdrawn events...')
    const withdrawalEvents = await client.getLogs({
      address: CONTRACT_ADDRESS,
      event: CONTRACT_ABI[1], // Withdrawn
      fromBlock,
      toBlock
    })

    console.log(`✅ Found ${withdrawalEvents.length} Withdrawn events`)

    // Clear existing data
    await prisma.indexedPayment.deleteMany()
    await prisma.indexedWithdrawal.deleteMany()
    await prisma.indexedUser.deleteMany()
    await prisma.globalStats.deleteMany()

    // Process and store PaymentReceived events
    const payments = []
    for (const event of paymentEvents) {
      const args = event.args
      const payment = {
        id: `${event.transactionHash}-${event.logIndex}`,
        payer: args.payer.toLowerCase(),
        amount: args.amount.toString(),
        currency: args.currency,
        sessionId: args.sessionId,
        timestamp: Number(args.timestamp),
        blockNumber: event.blockNumber.toString(),
        transactionHash: event.transactionHash,
        logIndex: event.logIndex
      }
      payments.push(payment)
    }

    // Process and store Withdrawn events
    const withdrawals = []
    for (const event of withdrawalEvents) {
      const args = event.args
      const withdrawal = {
        id: `${event.transactionHash}-${event.logIndex}`,
        to: args.to.toLowerCase(),
        amount: args.amount.toString(),
        currency: args.currency,
        timestamp: Number(args.timestamp),
        blockNumber: event.blockNumber.toString(),
        transactionHash: event.transactionHash,
        logIndex: event.logIndex
      }
      withdrawals.push(withdrawal)
    }

    // Insert payments into database
    for (const payment of payments) {
      await prisma.indexedPayment.create({ data: payment })
    }

    // Insert withdrawals into database
    for (const withdrawal of withdrawals) {
      await prisma.indexedWithdrawal.create({ data: withdrawal })
    }

    // Calculate user statistics
    const userStats = new Map()
    for (const payment of payments) {
      if (!userStats.has(payment.payer)) {
        userStats.set(payment.payer, {
          address: payment.payer,
          totalPaid: '0',
          paymentCount: 0,
          firstPaymentAt: new Date(payment.timestamp * 1000),
          lastPaymentAt: new Date(payment.timestamp * 1000)
        })
      }
      
      const user = userStats.get(payment.payer)
      user.totalPaid = (BigInt(user.totalPaid) + BigInt(payment.amount)).toString()
      user.paymentCount++
      
      const paymentTime = new Date(payment.timestamp * 1000)
      if (paymentTime < user.firstPaymentAt) {
        user.firstPaymentAt = paymentTime
      }
      if (paymentTime > user.lastPaymentAt) {
        user.lastPaymentAt = paymentTime
      }
    }

    // Insert user statistics
    for (const [address, stats] of userStats) {
      await prisma.indexedUser.create({
        data: {
          id: `user_${address.slice(2, 8)}`,
          address: stats.address,
          totalPaid: stats.totalPaid,
          paymentCount: stats.paymentCount,
          firstPaymentAt: stats.firstPaymentAt,
          lastPaymentAt: stats.lastPaymentAt
        }
      })
    }

    // Calculate global statistics
    const totalVolume = payments.reduce((sum, p) => sum + BigInt(p.amount), 0n)
    const uniqueUsers = userStats.size

    await prisma.globalStats.create({
      data: {
        id: 'main',
        totalPayments: payments.length,
        totalVolume: totalVolume.toString(),
        uniqueUsers: uniqueUsers
      }
    })

    console.log('')
    console.log('🎉 REAL EVENTS SUCCESSFULLY INDEXED!')
    console.log(`💰 ${payments.length} payments indexed`)
    console.log(`💸 ${withdrawals.length} withdrawals indexed`)
    console.log(`👥 ${uniqueUsers} unique users`)
    console.log(`📊 Total volume: ${(Number(totalVolume) / 1e18).toFixed(4)} CUSD`)
    console.log('')
    console.log('🌐 Visit http://localhost:3000/transactions to see your REAL data!')

  } catch (error) {
    console.error('❌ Error fetching real events:', error)
    console.log('')
    console.log('💡 Make sure:')
    console.log('1. Your contract is deployed on Celo Sepolia')
    console.log('2. You have some transactions on the contract')
    console.log('3. The RPC endpoint is accessible')
  } finally {
    await prisma.$disconnect()
  }
}

fetchRealEvents()
