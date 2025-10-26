const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkMyntraCards() {
  try {
    console.log('🔍 Checking Myntra gift cards for payment amount ₹7567...')
    
    // Get all Myntra gift cards
    const myntraCards = await prisma.giftCard.findMany({
      where: {
        isActive: true,
        isUsed: false,
        provider: 'myntra',
        currency: 'INR'
      },
      orderBy: { amount: 'asc' }
    })
    
    console.log(`\n📊 Found ${myntraCards.length} Myntra gift cards:`)
    myntraCards.forEach(card => {
      console.log(`  - ${card.name}: ₹${card.amount} (${card.provider})`)
    })
    
    // Find suitable cards for ₹7567
    const suitableCards = await prisma.giftCard.findMany({
      where: {
        isActive: true,
        isUsed: false,
        amount: { gte: 7567 },
        provider: 'myntra',
        currency: 'INR'
      },
      orderBy: { amount: 'asc' }
    })
    
    console.log(`\n✅ Suitable cards for ₹7567:`)
    if (suitableCards.length > 0) {
      suitableCards.forEach(card => {
        const bonus = card.amount - 7567
        console.log(`  - ${card.name}: ₹${card.amount} (+₹${bonus} bonus)`)
      })
    } else {
      console.log('  ❌ No Myntra cards with sufficient amount')
      
      // Check if there are any Myntra cards at all
      const anyMyntraCards = await prisma.giftCard.findMany({
        where: {
          isActive: true,
          isUsed: false,
          provider: 'myntra',
          currency: 'INR'
        },
        orderBy: { amount: 'desc' }
      })
      
      if (anyMyntraCards.length > 0) {
        console.log(`\n📋 Available Myntra cards (highest first):`)
        anyMyntraCards.forEach(card => {
          console.log(`  - ${card.name}: ₹${card.amount}`)
        })
      }
    }
    
    // Also check for any INR cards that could work
    const anyInrCards = await prisma.giftCard.findMany({
      where: {
        isActive: true,
        isUsed: false,
        amount: { gte: 7567 },
        currency: 'INR'
      },
      orderBy: { amount: 'asc' }
    })
    
    console.log(`\n🌐 Any INR cards for ₹7567:`)
    if (anyInrCards.length > 0) {
      anyInrCards.forEach(card => {
        const bonus = card.amount - 7567
        console.log(`  - ${card.name}: ₹${card.amount} (${card.provider}) (+₹${bonus} bonus)`)
      })
    } else {
      console.log('  ❌ No INR cards with sufficient amount')
    }
    
  } catch (error) {
    console.error('❌ Error checking Myntra cards:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkMyntraCards()

