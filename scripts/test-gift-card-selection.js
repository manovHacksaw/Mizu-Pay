const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testGiftCardSelection() {
  try {
    console.log('🧪 Testing gift card selection for payment page...')
    
    // Test different scenarios
    const testCases = [
      { amount: 2.83, store: 'Flipkart.com', currency: 'INR' },
      { amount: 5, store: 'amazon', currency: 'USD' },
      { amount: 100, store: 'myntra', currency: 'INR' },
      { amount: 50, store: 'nykaa', currency: 'INR' }
    ]
    
    for (const testCase of testCases) {
      console.log(`\n📝 Testing: ${testCase.store} - $${testCase.amount}`)
      
      // Simulate the API call logic
      let provider = 'amazon'
      let currency = 'USD'
      
      if (testCase.store) {
        const storeLower = testCase.store.toLowerCase()
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
      
      // Find exact match
      let giftCard = await prisma.giftCard.findFirst({
        where: {
          isActive: true,
          isUsed: false,
          amount: { gte: testCase.amount },
          provider: provider.toLowerCase(),
          currency: currency
        },
        orderBy: { amount: 'asc' }
      })
      
      if (giftCard) {
        console.log(`  ✅ Exact match found: ${giftCard.name} - ${giftCard.amount} ${giftCard.currency}`)
      } else {
        console.log(`  ⚠️ No exact match, finding alternatives...`)
        
        // Find alternatives
        const alternatives = await prisma.giftCard.findMany({
          where: {
            isActive: true,
            isUsed: false,
            provider: provider.toLowerCase(),
            currency: currency
          },
          orderBy: { amount: 'asc' },
          take: 3
        })
        
        if (alternatives.length > 0) {
          console.log(`  📋 Available alternatives:`)
          alternatives.forEach((alt, index) => {
            console.log(`    ${index + 1}. ${alt.name} - ${alt.amount} ${alt.currency}`)
          })
        } else {
          console.log(`  ❌ No alternatives found for ${provider} ${currency}`)
        }
      }
    }
    
    console.log('\n✅ Gift card selection test completed!')
    
  } catch (error) {
    console.error('❌ Error testing gift card selection:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testGiftCardSelection()

