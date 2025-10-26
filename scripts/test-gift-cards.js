const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testGiftCards() {
  try {
    console.log('🔍 Testing gift card availability...')

    // Check all gift cards
    const allGiftCards = await prisma.giftCard.findMany({
      where: {
        isActive: true,
        isUsed: false
      },
      orderBy: {
        amount: 'asc'
      }
    })

    console.log(`\n📊 Available Gift Cards: ${allGiftCards.length}`)
    
    // Group by provider and currency
    const summary = allGiftCards.reduce((acc, card) => {
      const key = `${card.provider}-${card.currency}`
      if (!acc[key]) {
        acc[key] = { count: 0, total: 0, cards: [] }
      }
      acc[key].count++
      acc[key].total += card.amount
      acc[key].cards.push({ amount: card.amount, code: card.code })
      return acc
    }, {})

    Object.entries(summary).forEach(([key, data]) => {
      console.log(`\n${key.toUpperCase()}:`)
      console.log(`  Cards: ${data.count}, Total Value: ${data.total}`)
      console.log(`  Amounts: ${data.cards.map(c => c.amount).join(', ')}`)
    })

    // Test gift card selection for different scenarios
    console.log('\n🧪 Testing gift card selection scenarios:')
    
    const testScenarios = [
      { amount: 5, store: 'amazon', description: 'Small Amazon payment' },
      { amount: 25, store: 'flipkart', description: 'Flipkart payment' },
      { amount: 100, store: 'myntra', description: 'Myntra payment' },
      { amount: 50, store: 'nykaa', description: 'Nykaa payment' },
      { amount: 1000, store: 'unknown', description: 'Unknown store' }
    ]

    for (const scenario of testScenarios) {
      console.log(`\n📝 ${scenario.description}:`)
      console.log(`  Amount: ${scenario.amount}, Store: ${scenario.store}`)
      
      // Simulate the gift card selection logic
      let provider = 'amazon'
      let currency = 'USD'
      
      if (scenario.store) {
        const storeLower = scenario.store.toLowerCase()
        if (storeLower.includes('flipkart')) {
          provider = 'flipkart'
          currency = 'INR'
        } else if (storeLower.includes('amazon')) {
          provider = 'amazon'
          currency = 'USD'
        } else if (storeLower.includes('myntra')) {
          provider = 'myntra'
          currency = 'INR'
        } else if (storeLower.includes('nykaa')) {
          provider = 'nykaa'
          currency = 'INR'
        }
      }

      // Find matching gift card
      let giftCard = await prisma.giftCard.findFirst({
        where: {
          isActive: true,
          isUsed: false,
          amount: { gte: scenario.amount },
          provider: provider.toLowerCase(),
          currency: currency
        },
        orderBy: { amount: 'asc' }
      })

      if (!giftCard) {
        // Try any available gift card
        giftCard = await prisma.giftCard.findFirst({
          where: {
            isActive: true,
            isUsed: false,
            amount: { gte: scenario.amount }
          },
          orderBy: { amount: 'asc' }
        })
      }

      if (giftCard) {
        console.log(`  ✅ Found: ${giftCard.name} - ${giftCard.amount} ${giftCard.currency} (${giftCard.provider})`)
      } else {
        console.log(`  ❌ No suitable gift card found`)
      }
    }

  } catch (error) {
    console.error('❌ Error testing gift cards:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testGiftCards()
