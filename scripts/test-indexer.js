const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testIndexer() {
  console.log('🧪 Testing real-time indexer...')
  
  try {
    // Check current data
    const payments = await prisma.indexedPayment.findMany()
    const withdrawals = await prisma.indexedWithdrawal.findMany()
    const users = await prisma.indexedUser.findMany()
    const stats = await prisma.globalStats.findFirst()
    
    console.log(`📊 Current data:`)
    console.log(`💰 Payments: ${payments.length}`)
    console.log(`💸 Withdrawals: ${withdrawals.length}`)
    console.log(`👥 Users: ${users.length}`)
    console.log(`📈 Total volume: ${stats ? (Number(stats.totalVolume) / 1e18).toFixed(4) : 0} CUSD`)
    
    if (payments.length > 0) {
      console.log(`\n🔍 Latest payment:`)
      const latest = payments[payments.length - 1]
      console.log(`   Amount: ${(Number(latest.amount) / 1e18).toFixed(4)} ${latest.currency}`)
      console.log(`   From: ${latest.payer}`)
      console.log(`   Block: ${latest.blockNumber}`)
      console.log(`   Time: ${new Date(latest.timestamp * 1000).toLocaleString()}`)
    }
    
  } catch (error) {
    console.error('❌ Error testing indexer:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testIndexer()
