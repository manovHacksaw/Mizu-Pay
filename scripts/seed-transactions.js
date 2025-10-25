const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedTransactions() {
  console.log('🌱 Seeding transaction data...')

  try {
    // Clear existing data
    await prisma.indexedPayment.deleteMany()
    await prisma.indexedWithdrawal.deleteMany()
    await prisma.indexedUser.deleteMany()
    await prisma.globalStats.deleteMany()

    // Create sample payments
    const payments = [
      {
        id: '0x1234567890abcdef-1',
        payer: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amount: '1000000000000000000', // 1 CUSD
        currency: 'CUSD',
        sessionId: 'session_001',
        timestamp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
        blockNumber: '12345678',
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        logIndex: 1
      },
      {
        id: '0x1234567890abcdef-2',
        payer: '0x8ba1f109551bD432803012645Hac136c',
        amount: '500000000000000000', // 0.5 CUSD
        currency: 'CUSD',
        sessionId: 'session_002',
        timestamp: Math.floor(Date.now() / 1000) - 1800, // 30 minutes ago
        blockNumber: '12345679',
        transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        logIndex: 2
      },
      {
        id: '0x1234567890abcdef-3',
        payer: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amount: '2000000000000000000', // 2 CUSD
        currency: 'CUSD',
        sessionId: 'session_003',
        timestamp: Math.floor(Date.now() / 1000) - 900, // 15 minutes ago
        blockNumber: '12345680',
        transactionHash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
        logIndex: 3
      }
    ]

    // Create sample withdrawals
    const withdrawals = [
      {
        id: '0x9876543210fedcba-1',
        to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amount: '1500000000000000000', // 1.5 CUSD
        currency: 'CUSD',
        timestamp: Math.floor(Date.now() / 1000) - 600, // 10 minutes ago
        blockNumber: '12345681',
        transactionHash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
        logIndex: 4
      }
    ]

    // Insert payments
    for (const payment of payments) {
      await prisma.indexedPayment.create({ data: payment })
    }

    // Insert withdrawals
    for (const withdrawal of withdrawals) {
      await prisma.indexedWithdrawal.create({ data: withdrawal })
    }

    // Create user statistics
    const users = [
      {
        id: 'user_001',
        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        totalPaid: '3000000000000000000', // 3 CUSD total
        paymentCount: 2,
        firstPaymentAt: new Date(Date.now() - 3600000),
        lastPaymentAt: new Date(Date.now() - 900000)
      },
      {
        id: 'user_002',
        address: '0x8ba1f109551bD432803012645Hac136c',
        totalPaid: '500000000000000000', // 0.5 CUSD total
        paymentCount: 1,
        firstPaymentAt: new Date(Date.now() - 1800000),
        lastPaymentAt: new Date(Date.now() - 1800000)
      }
    ]

    for (const user of users) {
      await prisma.indexedUser.create({ data: user })
    }

    // Create global stats
    await prisma.globalStats.create({
      data: {
        id: 'main',
        totalPayments: 3,
        totalVolume: '3500000000000000000', // 3.5 CUSD total
        uniqueUsers: 2
      }
    })

    console.log('✅ Transaction data seeded successfully!')
    console.log(`📊 Created ${payments.length} payments and ${withdrawals.length} withdrawals`)
    console.log(`👥 Created ${users.length} users with statistics`)
    console.log('🌐 Global stats updated')
    console.log('')
    console.log('🎉 Visit http://localhost:3000/transactions to see the data!')

  } catch (error) {
    console.error('❌ Error seeding data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedTransactions()
