const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testFuzzyMatching() {
  try {
    console.log('🧪 Testing fuzzy gift card matching...')
    
    const testCases = [
      { store: 'Amazon.com', amount: 5, currency: 'USD' },
      { store: 'Flipkart.com', amount: 2.83, currency: 'INR' },
      { store: 'Myntra', amount: 100, currency: 'INR' },
      { store: 'Nykaa', amount: 50, currency: 'INR' },
      { store: 'amazon.in', amount: 10, currency: 'USD' },
      { store: 'flipkart.in', amount: 25, currency: 'INR' }
    ]
    
    for (const testCase of testCases) {
      console.log(`\n📝 Testing: ${testCase.store} - $${testCase.amount}`)
      
      // Extract provider from store name
      const storeLower = testCase.store.toLowerCase()
      let provider = 'amazon'
      let currency = 'USD'
      
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
      
      console.log(`  Provider: ${provider}, Currency: ${currency}`)
      
      // Try exact match first
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
        console.log(`  ✅ Exact match: ${giftCard.name} - ${giftCard.amount} ${giftCard.currency}`)
      } else {
        console.log(`  ⚠️ No exact match, trying fuzzy matching...`)
        
        // Try fuzzy matching
        giftCard = await prisma.giftCard.findFirst({
          where: {
            isActive: true,
            isUsed: false,
            amount: { gte: testCase.amount },
            currency: currency,
            OR: [
              { provider: { contains: provider, mode: 'insensitive' } },
              { name: { contains: provider, mode: 'insensitive' } }
            ]
          },
          orderBy: { amount: 'asc' }
        })
        
        if (giftCard) {
          console.log(`  ✅ Fuzzy match: ${giftCard.name} - ${giftCard.amount} ${giftCard.currency}`)
        } else {
          console.log(`  ❌ No match found`)
        }
      }
    }
    
    console.log('\n✅ Fuzzy matching test completed!')
    
  } catch (error) {
    console.error('❌ Error testing fuzzy matching:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testFuzzyMatching()

