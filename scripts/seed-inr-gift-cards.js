const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const inrGiftCards = [
  // Amazon India Gift Cards
  {
    name: "Amazon India Gift Card",
    amount: 100,
    currency: "INR",
    provider: "amazon",
    code: "AMZN-INR-100-ABC123",
    pin: "1234"
  },
  {
    name: "Amazon India Gift Card",
    amount: 200,
    currency: "INR",
    provider: "amazon",
    code: "AMZN-INR-200-DEF456",
    pin: "5678"
  },
  {
    name: "Amazon India Gift Card",
    amount: 500,
    currency: "INR",
    provider: "amazon",
    code: "AMZN-INR-500-GHI789",
    pin: "9012"
  },
  {
    name: "Amazon India Gift Card",
    amount: 1000,
    currency: "INR",
    provider: "amazon",
    code: "AMZN-INR-1000-JKL012",
    pin: "3456"
  },
  {
    name: "Amazon India Gift Card",
    amount: 2000,
    currency: "INR",
    provider: "amazon",
    code: "AMZN-INR-2000-MNO345",
    pin: "7890"
  },

  // Flipkart Gift Cards
  {
    name: "Flipkart Gift Card",
    amount: 100,
    currency: "INR",
    provider: "flipkart",
    code: "FLIP-INR-100-PQR678",
    pin: "1111"
  },
  {
    name: "Flipkart Gift Card",
    amount: 250,
    currency: "INR",
    provider: "flipkart",
    code: "FLIP-INR-250-STU901",
    pin: "2222"
  },
  {
    name: "Flipkart Gift Card",
    amount: 500,
    currency: "INR",
    provider: "flipkart",
    code: "FLIP-INR-500-VWX234",
    pin: "3333"
  },
  {
    name: "Flipkart Gift Card",
    amount: 1000,
    currency: "INR",
    provider: "flipkart",
    code: "FLIP-INR-1000-YZA567",
    pin: "4444"
  },
  {
    name: "Flipkart Gift Card",
    amount: 2000,
    currency: "INR",
    provider: "flipkart",
    code: "FLIP-INR-2000-BCD890",
    pin: "5555"
  },

  // Myntra Gift Cards
  {
    name: "Myntra Gift Card",
    amount: 200,
    currency: "INR",
    provider: "myntra",
    code: "MYNT-INR-200-EFG123",
    pin: "6666"
  },
  {
    name: "Myntra Gift Card",
    amount: 500,
    currency: "INR",
    provider: "myntra",
    code: "MYNT-INR-500-HIJ456",
    pin: "7777"
  },
  {
    name: "Myntra Gift Card",
    amount: 1000,
    currency: "INR",
    provider: "myntra",
    code: "MYNT-INR-1000-KLM789",
    pin: "8888"
  },
  {
    name: "Myntra Gift Card",
    amount: 2000,
    currency: "INR",
    provider: "myntra",
    code: "MYNT-INR-2000-NOP012",
    pin: "9999"
  },

  // Nykaa Gift Cards
  {
    name: "Nykaa Gift Card",
    amount: 300,
    currency: "INR",
    provider: "nykaa",
    code: "NYKA-INR-300-QRS345",
    pin: "0000"
  },
  {
    name: "Nykaa Gift Card",
    amount: 500,
    currency: "INR",
    provider: "nykaa",
    code: "NYKA-INR-500-TUV678",
    pin: "1111"
  },
  {
    name: "Nykaa Gift Card",
    amount: 1000,
    currency: "INR",
    provider: "nykaa",
    code: "NYKA-INR-1000-WXY901",
    pin: "2222"
  },

  // Zomato Gift Cards
  {
    name: "Zomato Gift Card",
    amount: 200,
    currency: "INR",
    provider: "zomato",
    code: "ZOMA-INR-200-ZAB234",
    pin: "3333"
  },
  {
    name: "Zomato Gift Card",
    amount: 500,
    currency: "INR",
    provider: "zomato",
    code: "ZOMA-INR-500-CDE567",
    pin: "4444"
  },
  {
    name: "Zomato Gift Card",
    amount: 1000,
    currency: "INR",
    provider: "zomato",
    code: "ZOMA-INR-1000-FGH890",
    pin: "5555"
  },

  // Swiggy Gift Cards
  {
    name: "Swiggy Gift Card",
    amount: 150,
    currency: "INR",
    provider: "swiggy",
    code: "SWIG-INR-150-IJK123",
    pin: "6666"
  },
  {
    name: "Swiggy Gift Card",
    amount: 300,
    currency: "INR",
    provider: "swiggy",
    code: "SWIG-INR-300-LMN456",
    pin: "7777"
  },
  {
    name: "Swiggy Gift Card",
    amount: 500,
    currency: "INR",
    provider: "swiggy",
    code: "SWIG-INR-500-OPQ789",
    pin: "8888"
  },

  // BookMyShow Gift Cards
  {
    name: "BookMyShow Gift Card",
    amount: 250,
    currency: "INR",
    provider: "bookmyshow",
    code: "BMS-INR-250-RST012",
    pin: "9999"
  },
  {
    name: "BookMyShow Gift Card",
    amount: 500,
    currency: "INR",
    provider: "bookmyshow",
    code: "BMS-INR-500-UVW345",
    pin: "0000"
  },
  {
    name: "BookMyShow Gift Card",
    amount: 1000,
    currency: "INR",
    provider: "bookmyshow",
    code: "BMS-INR-1000-XYZ678",
    pin: "1111"
  }
]

async function seedGiftCards() {
  try {
    console.log('🌱 Starting to seed INR gift cards...')
    
    // Clear existing gift cards (optional - remove this if you want to keep existing ones)
    console.log('🗑️  Clearing existing gift cards...')
    await prisma.giftCard.deleteMany({})
    
    console.log('💳 Creating INR gift cards...')
    
    for (const giftCard of inrGiftCards) {
      await prisma.giftCard.create({
        data: giftCard
      })
      console.log(`✅ Created ${giftCard.name} - ${giftCard.amount} ${giftCard.currency}`)
    }
    
    console.log(`🎉 Successfully seeded ${inrGiftCards.length} INR gift cards!`)
    
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
      console.log(`${item.provider}: ${item._count.id} cards, Total value: ₹${item._sum.amount}`)
    })
    
  } catch (error) {
    console.error('❌ Error seeding gift cards:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedGiftCards()
