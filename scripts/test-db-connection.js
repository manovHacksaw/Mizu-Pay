const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Test gift card access
    const giftCardCount = await prisma.giftCard.count()
    console.log(`📊 Total gift cards: ${giftCardCount}`)
    
    // Test available gift cards
    const availableGiftCards = await prisma.giftCard.findMany({
      where: {
        isActive: true,
        isUsed: false
      },
      take: 3
    })
    
    console.log('🎁 Sample available gift cards:')
    availableGiftCards.forEach(card => {
      console.log(`  - ${card.name}: ${card.amount} ${card.currency} (${card.provider})`)
    })
    
    // Test payment sessions
    const sessionCount = await prisma.paymentSession.count()
    console.log(`📝 Payment sessions: ${sessionCount}`)
    
    console.log('✅ All database operations working correctly!')
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
