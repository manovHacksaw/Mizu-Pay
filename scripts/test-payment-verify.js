const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testPaymentVerification() {
  try {
    console.log('🧪 Testing payment verification logic...')
    
    // Test the exact scenario from the logs
    const testData = {
      amount: 86.23,
      store: 'Myntra',
      brand: 'Moda RapidoWhite Slim Fit Striped Short Sleeves Cotton Casual Shirt'
    }
    
    console.log('Test data:', testData)
    
    // Test provider detection
    let provider = 'amazon'
    let currency = 'USD'
    
    if (testData.store) {
      const storeLower = testData.store.toLowerCase()
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
    
    console.log('Detected provider:', provider, 'Currency:', currency)
    
    // Test gift card search
    const giftCards = await prisma.giftCard.findMany({
      where: {
        isActive: true,
        isUsed: false,
        amount: { gte: testData.amount },
        provider: provider.toLowerCase(),
        currency: currency
      },
      orderBy: { amount: 'asc' },
      take: 1
    })
    
    console.log('Found gift cards:', giftCards.length)
    
    if (giftCards.length > 0) {
      console.log('✅ Gift card found:', {
        id: giftCards[0].id,
        name: giftCards[0].name,
        amount: giftCards[0].amount,
        currency: giftCards[0].currency,
        provider: giftCards[0].provider
      })
    } else {
      console.log('❌ No gift card found, trying alternatives...')
      
      // Try any available gift card
      const anyGiftCards = await prisma.giftCard.findMany({
        where: {
          isActive: true,
          isUsed: false,
          amount: { gte: testData.amount }
        },
        orderBy: { amount: 'asc' },
        take: 1
      })
      
      if (anyGiftCards.length > 0) {
        console.log('✅ Alternative gift card found:', {
          id: anyGiftCards[0].id,
          name: anyGiftCards[0].name,
          amount: anyGiftCards[0].amount,
          currency: anyGiftCards[0].currency,
          provider: anyGiftCards[0].provider
        })
      } else {
        console.log('❌ No gift cards available at all')
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing payment verification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPaymentVerification()
