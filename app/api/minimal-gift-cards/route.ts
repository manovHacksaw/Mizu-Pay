import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const amount = parseFloat(searchParams.get('amount') || '0')
    const provider = searchParams.get('provider') || ''
    const currency = searchParams.get('currency') || 'USD'
    
    console.log('🧪 Minimal gift card API test...', { amount, provider, currency })
    
    // Return relevant hardcoded gift card data based on request
    let giftCards = []
    
    if (currency === 'INR') {
      if (provider === 'myntra') {
        // For Myntra, show available INR cards with different amounts
        if (amount >= 5000) {
          // For large amounts, show higher value cards
          giftCards = [
            {
              id: 'flipkart-10000',
              name: 'Flipkart Gift Card',
              amount: 10000,
              currency: 'INR',
              provider: 'flipkart'
            },
            {
              id: 'myntra-5000',
              name: 'Myntra Gift Card',
              amount: 5000,
              currency: 'INR',
              provider: 'myntra'
            }
          ]
        } else {
          // For smaller amounts, show more appropriate cards
          giftCards = [
            {
              id: 'myntra-5000',
              name: 'Myntra Gift Card',
              amount: 5000,
              currency: 'INR',
              provider: 'myntra'
            },
            {
              id: 'flipkart-5000',
              name: 'Flipkart Gift Card',
              amount: 5000,
              currency: 'INR',
              provider: 'flipkart'
            },
            {
              id: 'nykaa-5000',
              name: 'Nykaa Gift Card',
              amount: 5000,
              currency: 'INR',
              provider: 'nykaa'
            }
          ]
        }
      } else {
        giftCards = [
          {
            id: 'flipkart-10000',
            name: 'Flipkart Gift Card',
            amount: 10000,
            currency: 'INR',
            provider: 'flipkart'
          },
          {
            id: 'myntra-5000',
            name: 'Myntra Gift Card',
            amount: 5000,
            currency: 'INR',
            provider: 'myntra'
          }
        ]
      }
    } else {
      // USD cards
      giftCards = [
        {
          id: 'amazon-100',
          name: 'Amazon Gift Card',
          amount: 100,
          currency: 'USD',
          provider: 'amazon'
        },
        {
          id: 'amazon-50',
          name: 'Amazon Gift Card',
          amount: 50,
          currency: 'USD',
          provider: 'amazon'
        }
      ]
    }
    
    // Find the best card (smallest amount >= requested amount)
    const suitableCard = giftCards.find(card => card.amount >= amount) || giftCards[0]
    
    return NextResponse.json({
      success: true,
      giftCard: suitableCard,
      availableAmounts: giftCards
    })
    
  } catch (error) {
    console.error('❌ Error in minimal API:', error)
    return NextResponse.json(
      { error: 'Minimal API failed', details: error.message },
      { status: 500 }
    )
  }
}
