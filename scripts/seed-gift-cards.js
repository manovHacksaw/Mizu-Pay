const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const sampleGiftCards = [
  // Amazon Gift Cards
  { name: 'Amazon Gift Card', amount: 10, currency: 'USD', provider: 'amazon', code: 'AMZN-10-ABC123', pin: null },
  { name: 'Amazon Gift Card', amount: 25, currency: 'USD', provider: 'amazon', code: 'AMZN-25-DEF456', pin: null },
  { name: 'Amazon Gift Card', amount: 50, currency: 'USD', provider: 'amazon', code: 'AMZN-50-GHI789', pin: null },
  { name: 'Amazon Gift Card', amount: 100, currency: 'USD', provider: 'amazon', code: 'AMZN-100-JKL012', pin: null },
  { name: 'Amazon Gift Card', amount: 200, currency: 'USD', provider: 'amazon', code: 'AMZN-200-MNO345', pin: null },
  { name: 'Amazon Gift Card', amount: 500, currency: 'USD', provider: 'amazon', code: 'AMZN-500-PQR678', pin: null },

  // Flipkart Gift Cards
  { name: 'Flipkart Gift Card', amount: 500, currency: 'INR', provider: 'flipkart', code: 'FLIP-500-STU901', pin: '1234' },
  { name: 'Flipkart Gift Card', amount: 1000, currency: 'INR', provider: 'flipkart', code: 'FLIP-1000-VWX234', pin: '5678' },
  { name: 'Flipkart Gift Card', amount: 2000, currency: 'INR', provider: 'flipkart', code: 'FLIP-2000-YZA567', pin: '9012' },
  { name: 'Flipkart Gift Card', amount: 5000, currency: 'INR', provider: 'flipkart', code: 'FLIP-5000-BCD890', pin: '3456' },
  { name: 'Flipkart Gift Card', amount: 10000, currency: 'INR', provider: 'flipkart', code: 'FLIP-10000-EFG123', pin: '7890' },

  // Myntra Gift Cards
  { name: 'Myntra Gift Card', amount: 1000, currency: 'INR', provider: 'myntra', code: 'MYNT-1000-HIJ456', pin: '2468' },
  { name: 'Myntra Gift Card', amount: 2000, currency: 'INR', provider: 'myntra', code: 'MYNT-2000-KLM789', pin: '1357' },
  { name: 'Myntra Gift Card', amount: 5000, currency: 'INR', provider: 'myntra', code: 'MYNT-5000-NOP012', pin: '8024' },

  // Nykaa Gift Cards
  { name: 'Nykaa Gift Card', amount: 1000, currency: 'INR', provider: 'nykaa', code: 'NYKA-1000-QRS345', pin: '9753' },
  { name: 'Nykaa Gift Card', amount: 2000, currency: 'INR', provider: 'nykaa', code: 'NYKA-2000-TUV678', pin: '6420' },
  { name: 'Nykaa Gift Card', amount: 5000, currency: 'INR', provider: 'nykaa', code: 'NYKA-5000-WXY901', pin: '1864' },

  // Additional Amazon cards for higher amounts
  { name: 'Amazon Gift Card', amount: 15, currency: 'USD', provider: 'amazon', code: 'AMZN-15-ZAB234', pin: null },
  { name: 'Amazon Gift Card', amount: 30, currency: 'USD', provider: 'amazon', code: 'AMZN-30-CDE567', pin: null },
  { name: 'Amazon Gift Card', amount: 75, currency: 'USD', provider: 'amazon', code: 'AMZN-75-FGH890', pin: null },
  { name: 'Amazon Gift Card', amount: 150, currency: 'USD', provider: 'amazon', code: 'AMZN-150-IJK123', pin: null },
  { name: 'Amazon Gift Card', amount: 300, currency: 'USD', provider: 'amazon', code: 'AMZN-300-LMN456', pin: null },
  { name: 'Amazon Gift Card', amount: 750, currency: 'USD', provider: 'amazon', code: 'AMZN-750-OPQ789', pin: null },
]

async function seedGiftCards() {
  try {
    console.log('🌱 Starting to seed gift cards...')

    // Clear existing gift cards
    await prisma.giftCard.deleteMany({})
    console.log('🗑️ Cleared existing gift cards')

    // Create new gift cards
    for (const giftCard of sampleGiftCards) {
      await prisma.giftCard.create({
        data: {
          name: giftCard.name,
          amount: giftCard.amount,
          currency: giftCard.currency,
          provider: giftCard.provider,
          code: giftCard.code,
          pin: giftCard.pin,
          isActive: true,
          isUsed: false
        }
      })
    }

    console.log(`✅ Successfully seeded ${sampleGiftCards.length} gift cards`)
    
    // Display summary
    const summary = await prisma.giftCard.groupBy({
      by: ['provider', 'currency'],
      _count: {
        id: true
      },
      _sum: {
        amount: true
      }
    })

    console.log('\n📊 Gift Card Summary:')
    summary.forEach(item => {
      console.log(`${item.provider} (${item.currency}): ${item._count.id} cards, Total value: ${item._sum.amount}`)
    })

  } catch (error) {
    console.error('❌ Error seeding gift cards:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedGiftCards()
