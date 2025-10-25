const { PrismaClient } = require('@prisma/client')
const { createPublicClient, http, parseAbi } = require('viem')

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

let lastProcessedBlock = null
let isRunning = false

async function getLastProcessedBlock() {
  try {
    const lastPayment = await prisma.indexedPayment.findFirst({
      orderBy: { blockNumber: 'desc' }
    })
    
    if (lastPayment) {
      return BigInt(lastPayment.blockNumber)
    }
    
    // If no payments exist, start from 1000 blocks ago
    const latestBlock = await client.getBlockNumber()
    return latestBlock - 1000n
  } catch (error) {
    console.error('Error getting last processed block:', error)
    const latestBlock = await client.getBlockNumber()
    return latestBlock - 1000n
  }
}

async function fetchNewEvents() {
  if (isRunning) return
  isRunning = true

  try {
    const latestBlock = await client.getBlockNumber()
    
    if (lastProcessedBlock === null) {
      lastProcessedBlock = await getLastProcessedBlock()
    }

    // Only process new blocks
    if (lastProcessedBlock >= latestBlock) {
      console.log(`⏳ No new blocks. Latest: ${latestBlock}, Last processed: ${lastProcessedBlock}`)
      return
    }

    console.log(`🔍 Scanning new blocks ${lastProcessedBlock + 1n} to ${latestBlock}`)

    // Fetch new PaymentReceived events
    const paymentEvents = await client.getLogs({
      address: CONTRACT_ADDRESS,
      event: CONTRACT_ABI[0], // PaymentReceived
      fromBlock: lastProcessedBlock + 1n,
      toBlock: latestBlock
    })

    // Fetch new Withdrawn events
    const withdrawalEvents = await client.getLogs({
      address: CONTRACT_ADDRESS,
      event: CONTRACT_ABI[1], // Withdrawn
      fromBlock: lastProcessedBlock + 1n,
      toBlock: latestBlock
    })

    if (paymentEvents.length > 0 || withdrawalEvents.length > 0) {
      console.log(`💰 Found ${paymentEvents.length} new payments`)
      console.log(`💸 Found ${withdrawalEvents.length} new withdrawals`)

      // Process new payments
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

        // Check if payment already exists
        const existing = await prisma.indexedPayment.findUnique({
          where: { id: payment.id }
        })

        if (!existing) {
          await prisma.indexedPayment.create({ data: payment })
          
          // Display detailed transaction info
          const amountInCUSD = (Number(payment.amount) / 1e18).toFixed(4)
          console.log(`💰 NEW PAYMENT DETECTED!`)
          console.log(`   👤 Payer: ${payment.payer}`)
          console.log(`   💵 Amount: ${amountInCUSD} ${payment.currency}`)
          console.log(`   🆔 Session: ${payment.sessionId}`)
          console.log(`   📦 Block: ${payment.blockNumber}`)
          console.log(`   🔗 Tx Hash: ${payment.transactionHash}`)
          console.log(`   ⏰ Time: ${new Date(payment.timestamp * 1000).toLocaleString()}`)
          console.log(`   🌐 Explorer: https://sepolia.celoscan.io/tx/${payment.transactionHash}`)
          console.log('')
          
          // Update user stats
          await updateUserStats(payment.payer, payment.amount, payment.timestamp)
        }
      }

      // Process new withdrawals
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

        // Check if withdrawal already exists
        const existing = await prisma.indexedWithdrawal.findUnique({
          where: { id: withdrawal.id }
        })

        if (!existing) {
          await prisma.indexedWithdrawal.create({ data: withdrawal })
          
          // Display detailed withdrawal info
          const amountInCUSD = (Number(withdrawal.amount) / 1e18).toFixed(4)
          console.log(`💸 NEW WITHDRAWAL DETECTED!`)
          console.log(`   👤 Recipient: ${withdrawal.to}`)
          console.log(`   💵 Amount: ${amountInCUSD} ${withdrawal.currency}`)
          console.log(`   📦 Block: ${withdrawal.blockNumber}`)
          console.log(`   🔗 Tx Hash: ${withdrawal.transactionHash}`)
          console.log(`   ⏰ Time: ${new Date(withdrawal.timestamp * 1000).toLocaleString()}`)
          console.log(`   🌐 Explorer: https://sepolia.celoscan.io/tx/${withdrawal.transactionHash}`)
          console.log('')
        }
      }

      // Update global stats
      await updateGlobalStats()
    }

    lastProcessedBlock = latestBlock
    console.log(`✅ Real-time indexing complete. Processed up to block ${latestBlock}`)

  } catch (error) {
    console.error('❌ Error in real-time indexing:', error)
  } finally {
    isRunning = false
  }
}

async function updateUserStats(address, amount, timestamp) {
  try {
    const existingUser = await prisma.indexedUser.findUnique({
      where: { address }
    })

    const paymentTime = new Date(timestamp * 1000)

    if (existingUser) {
      // Update existing user
      await prisma.indexedUser.update({
        where: { address },
        data: {
          totalPaid: (BigInt(existingUser.totalPaid) + BigInt(amount)).toString(),
          paymentCount: existingUser.paymentCount + 1,
          lastPaymentAt: paymentTime
        }
      })
    } else {
      // Create new user
      await prisma.indexedUser.create({
        data: {
          id: `user_${address.slice(2, 8)}`,
          address,
          totalPaid: amount,
          paymentCount: 1,
          firstPaymentAt: paymentTime,
          lastPaymentAt: paymentTime
        }
      })
    }
  } catch (error) {
    console.error('Error updating user stats:', error)
  }
}

async function updateGlobalStats() {
  try {
    const payments = await prisma.indexedPayment.findMany()
    const users = await prisma.indexedUser.findMany()
    
    const totalVolume = payments.reduce((sum, p) => sum + BigInt(p.amount), 0n)
    const uniqueUsers = users.length

    await prisma.globalStats.upsert({
      where: { id: 'main' },
      update: {
        totalPayments: payments.length,
        totalVolume: totalVolume.toString(),
        uniqueUsers: uniqueUsers
      },
      create: {
        id: 'main',
        totalPayments: payments.length,
        totalVolume: totalVolume.toString(),
        uniqueUsers: uniqueUsers
      }
    })
  } catch (error) {
    console.error('Error updating global stats:', error)
  }
}

async function startRealTimeIndexing() {
  console.log('🚀 Starting REAL-TIME blockchain indexer...')
  console.log(`📋 Contract: ${CONTRACT_ADDRESS}`)
  console.log(`🌐 Network: Celo Sepolia Testnet`)
  console.log(`⏰ Polling every 10 seconds for new events`)
  console.log('')

  // Show existing transactions
  await showExistingTransactions()

  // Initial sync
  await fetchNewEvents()

  // Set up polling every 10 seconds
  setInterval(async () => {
    await fetchNewEvents()
  }, 10000) // 10 seconds

  console.log('✅ Real-time indexer is running!')
  console.log('💡 Make a transaction on your contract to see it indexed automatically!')
}

async function showExistingTransactions() {
  try {
    const payments = await prisma.indexedPayment.findMany({
      orderBy: { timestamp: 'desc' },
      take: 5 // Show last 5 payments
    })
    
    const withdrawals = await prisma.indexedWithdrawal.findMany({
      orderBy: { timestamp: 'desc' },
      take: 5 // Show last 5 withdrawals
    })
    
    const stats = await prisma.globalStats.findFirst()
    
    console.log('📊 EXISTING TRANSACTIONS:')
    console.log(`💰 Total Payments: ${payments.length}`)
    console.log(`💸 Total Withdrawals: ${withdrawals.length}`)
    console.log(`📈 Total Volume: ${stats ? (Number(stats.totalVolume) / 1e18).toFixed(4) : 0} CUSD`)
    console.log('')
    
    if (payments.length > 0) {
      console.log('💳 RECENT PAYMENTS:')
      for (const payment of payments) {
        const amountInCUSD = (Number(payment.amount) / 1e18).toFixed(4)
        console.log(`   👤 ${payment.payer} → ${amountInCUSD} ${payment.currency} (${payment.sessionId})`)
        console.log(`      📦 Block: ${payment.blockNumber} | ⏰ ${new Date(payment.timestamp * 1000).toLocaleString()}`)
      }
      console.log('')
    }
    
    if (withdrawals.length > 0) {
      console.log('💸 RECENT WITHDRAWALS:')
      for (const withdrawal of withdrawals) {
        const amountInCUSD = (Number(withdrawal.amount) / 1e18).toFixed(4)
        console.log(`   👤 ${withdrawal.to} ← ${amountInCUSD} ${withdrawal.currency}`)
        console.log(`      📦 Block: ${withdrawal.blockNumber} | ⏰ ${new Date(withdrawal.timestamp * 1000).toLocaleString()}`)
      }
      console.log('')
    }
    
  } catch (error) {
    console.error('Error showing existing transactions:', error)
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down real-time indexer...')
  await prisma.$disconnect()
  process.exit(0)
})

startRealTimeIndexing()
