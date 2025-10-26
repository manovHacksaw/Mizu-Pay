const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkCardsFor4872() {
  try {
    console.log('🔍 Checking gift cards for Myntra purchase of ₹4,872...')
    
    // Find cards with sufficient amount
    const suitableCards = await prisma.giftCard.findMany({
      where: {
        isActive: true,
        isUsed: false,
        amount: { gte: 4872 },
        currency: 'INR'
      },
      orderBy: { amount: 'asc' }
    })
    
    console.log(`\n✅ Suitable cards for ₹4,872:`)
    if (suitableCards.length > 0) {
      suitableCards.forEach(card => {
        const bonus = card.amount - 4872
        console.log(`  - ${card.name}: ₹${card.amount} (${card.provider}) +₹${bonus} bonus`)
      })
    } else {
      console.log('  ❌ No cards with sufficient amount')
    }
    
    // Check Myntra specific cards
    const myntraCards = await prisma.giftCard.findMany({
      where: {
        isActive: true,
        isUsed: false,
        provider: 'myntra',
        currency: 'INR'
      },
      orderBy: { amount: 'desc' }
    })
    
    console.log(`\n📋 Available Myntra cards:`)
    myntraCards.forEach(card => {
      const shortfall = 4872 - card.amount
      console.log(`  - ${card.name}: ₹${card.amount} (${shortfall > 0 ? `₹${shortfall} short` : 'sufficient'})`)
    })
    
    // Check all INR cards
    const allInrCards = await prisma.giftCard.findMany({
      where: {
        isActive: true,
        isUsed: false,
        currency: 'INR'
      },
      orderBy: { amount: 'asc' }
    })
    
    console.log(`\n🌐 All INR cards:`)
    allInrCards.forEach(card => {
      const bonus = card.amount - 4872
      const status = card.amount >= 4872 ? `✅ +₹${bonus} bonus` : `❌ ₹${4872 - card.amount} short`
      console.log(`  - ${card.name}: ₹${card.amount} (${card.provider}) ${status}`)
    })
    
  } catch (error) {
    console.error('❌ Error checking cards:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCardsFor4872()
