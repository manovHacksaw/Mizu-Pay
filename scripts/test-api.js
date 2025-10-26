const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAPI() {
  try {
    console.log('🧪 Testing gift card API logic...')
    
    // Test the exact logic from the API
    const amount = 5
    const provider = 'amazon'
    const currency = 'USD'
    
    console.log('Searching for:', { amount, provider, currency })
    
    // Find the nearest greater value gift card
    const availableGiftCards = await prisma.giftCard.findMany({
      where: {
        isActive: true,
        isUsed: false,
        amount: {
          gte: amount
        },
        provider: provider.toLowerCase(),
        currency: currency.toUpperCase()
      },
      orderBy: {
        amount: 'asc'
      },
      take: 1
    })
    
    console.log('Found gift cards:', availableGiftCards.length)
    
    if (availableGiftCards.length === 0) {
      console.log('No exact match, trying fallback...')
      
      // Try to get any available gift cards
      const fallbackCards = await prisma.giftCard.findMany({
        where: {
          isActive: true,
          isUsed: false,
          provider: provider.toLowerCase(),
          currency: currency.toUpperCase()
        },
        orderBy: {
          amount: 'asc'
        },
        take: 3
      })
      
      console.log('Fallback cards:', fallbackCards.length)
      
      if (fallbackCards.length > 0) {
        const selectedGiftCard = fallbackCards[0]
        console.log('✅ Fallback gift card found:', {
          id: selectedGiftCard.id,
          name: selectedGiftCard.name,
          amount: selectedGiftCard.amount,
          currency: selectedGiftCard.currency,
          provider: selectedGiftCard.provider
        })
      }
    } else {
      const selectedGiftCard = availableGiftCards[0]
      console.log('✅ Exact match found:', {
        id: selectedGiftCard.id,
        name: selectedGiftCard.name,
        amount: selectedGiftCard.amount,
        currency: selectedGiftCard.currency,
        provider: selectedGiftCard.provider
      })
    }
    
  } catch (error) {
    console.error('❌ Error testing API logic:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAPI()
