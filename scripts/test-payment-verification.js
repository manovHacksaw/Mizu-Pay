const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testPaymentVerification() {
  try {
    console.log('🧪 Testing payment verification logic...')
    
    // Test the gift card selection logic
    const testScenarios = [
      { amount: 2.83, store: 'Flipkart.com', brand: 'Test Product' },
      { amount: 5, store: 'amazon', brand: 'Amazon Product' },
      { amount: 100, store: 'myntra', brand: 'Myntra Product' },
      { amount: 50, store: 'nykaa', brand: 'Nykaa Product' }
    ]
    
    for (const scenario of testScenarios) {
      console.log(`\n📝 Testing: ${scenario.store} - $${scenario.amount}`)
      
      // Simulate the gift card selection logic from the API
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
      
      console.log(`  Provider: ${provider}, Currency: ${currency}`)
      
      // First try to find exact provider match
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
        console.log('  No exact provider match, trying any available gift card')
        giftCard = await prisma.giftCard.findFirst({
          where: {
            isActive: true,
            isUsed: false,
            amount: { gte: scenario.amount }
          },
          orderBy: { amount: 'asc' }
        })
      }
      
      if (!giftCard) {
        console.log('  No gift card with sufficient amount, trying any available')
        giftCard = await prisma.giftCard.findFirst({
          where: {
            isActive: true,
            isUsed: false
          },
          orderBy: { amount: 'asc' }
        })
      }
      
      if (giftCard) {
        console.log(`  ✅ Found: ${giftCard.name} - ${giftCard.amount} ${giftCard.currency} (${giftCard.provider})`)
        console.log(`  Code: ${giftCard.code}`)
      } else {
        console.log(`  ❌ No suitable gift card found`)
      }
    }
    
    console.log('\n✅ Payment verification logic test completed!')
    
  } catch (error) {
    console.error('❌ Error testing payment verification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPaymentVerification()
