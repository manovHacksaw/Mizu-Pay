const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const usdGiftCards = [
  // Amazon US Gift Cards
  {
    name: "Amazon US Gift Card",
    amount: 10,
    currency: "USD",
    provider: "amazon",
    code: "AMZN-USD-10-ABC123",
    pin: "1234"
  },
  {
    name: "Amazon US Gift Card",
    amount: 25,
    currency: "USD",
    provider: "amazon",
    code: "AMZN-USD-25-DEF456",
    pin: "5678"
  },
  {
    name: "Amazon US Gift Card",
    amount: 50,
    currency: "USD",
    provider: "amazon",
    code: "AMZN-USD-50-GHI789",
    pin: "9012"
  },
  {
    name: "Amazon US Gift Card",
    amount: 100,
    currency: "USD",
    provider: "amazon",
    code: "AMZN-USD-100-JKL012",
    pin: "3456"
  },

  // Apple Gift Cards
  {
    name: "Apple Gift Card",
    amount: 25,
    currency: "USD",
    provider: "apple",
    code: "APPL-USD-25-MNO345",
    pin: "7890"
  },
  {
    name: "Apple Gift Card",
    amount: 50,
    currency: "USD",
    provider: "apple",
    code: "APPL-USD-50-PQR678",
    pin: "1111"
  },
  {
    name: "Apple Gift Card",
    amount: 100,
    currency: "USD",
    provider: "apple",
    code: "APPL-USD-100-STU901",
    pin: "2222"
  },

  // Google Play Gift Cards
  {
    name: "Google Play Gift Card",
    amount: 10,
    currency: "USD",
    provider: "google",
    code: "GOOG-USD-10-VWX234",
    pin: "3333"
  },
  {
    name: "Google Play Gift Card",
    amount: 25,
    currency: "USD",
    provider: "google",
    code: "GOOG-USD-25-YZA567",
    pin: "4444"
  },
  {
    name: "Google Play Gift Card",
    amount: 50,
    currency: "USD",
    provider: "google",
    code: "GOOG-USD-50-BCD890",
    pin: "5555"
  },

  // Netflix Gift Cards
  {
    name: "Netflix Gift Card",
    amount: 15,
    currency: "USD",
    provider: "netflix",
    code: "NETF-USD-15-EFG123",
    pin: "6666"
  },
  {
    name: "Netflix Gift Card",
    amount: 30,
    currency: "USD",
    provider: "netflix",
    code: "NETF-USD-30-HIJ456",
    pin: "7777"
  },

  // Spotify Gift Cards
  {
    name: "Spotify Gift Card",
    amount: 10,
    currency: "USD",
    provider: "spotify",
    code: "SPOT-USD-10-KLM789",
    pin: "8888"
  },
  {
    name: "Spotify Gift Card",
    amount: 25,
    currency: "USD",
    provider: "spotify",
    code: "SPOT-USD-25-NOP012",
    pin: "9999"
  },

  // Steam Gift Cards
  {
    name: "Steam Gift Card",
    amount: 20,
    currency: "USD",
    provider: "steam",
    code: "STEA-USD-20-QRS345",
    pin: "0000"
  },
  {
    name: "Steam Gift Card",
    amount: 50,
    currency: "USD",
    provider: "steam",
    code: "STEA-USD-50-TUV678",
    pin: "1111"
  }
]

async function seedUsdGiftCards() {
  try {
    console.log('🌱 Starting to seed USD gift cards...')
    
    console.log('💳 Creating USD gift cards...')
    
    for (const giftCard of usdGiftCards) {
      await prisma.giftCard.create({
        data: giftCard
      })
      console.log(`✅ Created ${giftCard.name} - $${giftCard.amount} ${giftCard.currency}`)
    }
    
    console.log(`🎉 Successfully seeded ${usdGiftCards.length} USD gift cards!`)
    
    // Show summary by provider
    const summary = await prisma.giftCard.groupBy({
      by: ['provider'],
      _count: {
        id: true
      },
      _sum: {
        amount: true
      }
    })
    
    console.log('\n📊 Gift Card Summary:')
    summary.forEach(item => {
      console.log(`${item.provider}: ${item._count.id} cards, Total value: $${item._sum.amount}`)
    })
    
  } catch (error) {
    console.error('❌ Error seeding gift cards:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedUsdGiftCards()
