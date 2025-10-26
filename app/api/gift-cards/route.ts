import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Get available gift cards for a given amount and provider
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const amount = parseFloat(searchParams.get('amount') || '0')
    const provider = searchParams.get('provider') || ''
    const currency = searchParams.get('currency') || 'USD'

    if (amount <= 0) {
      // If amount is 0 or negative, return available gift cards without filtering by amount
      const availableGiftCards = await prisma.giftCard.findMany({
        where: {
          isActive: true,
          isUsed: false,
          ...(provider && { provider: provider.toLowerCase() }),
          ...(currency && { currency: currency.toUpperCase() })
        },
        orderBy: {
          amount: 'asc'
        },
        take: 3
      })

      return NextResponse.json({
        success: true,
        availableAmounts: availableGiftCards.map(card => ({
          id: card.id,
          name: card.name,
          amount: card.amount,
          currency: card.currency,
          provider: card.provider
        }))
      })
    }

    // Simplified gift card search
    console.log('Searching for gift cards:', { amount, provider, currency })
    
    // First try to find any available gift cards
    let availableGiftCards = await prisma.giftCard.findMany({
      where: {
        isActive: true,
        isUsed: false,
        amount: {
          gte: amount
        }
      },
      orderBy: {
        amount: 'asc'
      },
      take: 3
    })
    
    console.log('Found gift cards:', availableGiftCards.length)

    if (availableGiftCards.length === 0) {
      const availableAmounts = await getAvailableAmounts(provider, currency)
      return NextResponse.json({
        success: true,
        message: 'No exact match found, showing available options',
        availableAmounts: availableAmounts.slice(0, 3) // Return top 3 options
      })
    }

    const selectedGiftCard = availableGiftCards[0]

    return NextResponse.json({
      success: true,
      giftCard: {
        id: selectedGiftCard.id,
        name: selectedGiftCard.name,
        amount: selectedGiftCard.amount,
        currency: selectedGiftCard.currency,
        provider: selectedGiftCard.provider,
        // Don't return code and pin until payment is confirmed
      },
      selectedAmount: selectedGiftCard.amount,
      difference: selectedGiftCard.amount - amount
    })
  } catch (error) {
    console.error('Error finding gift card:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      amount,
      provider,
      currency
    })
    return NextResponse.json(
      { error: 'Failed to find gift card', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Helper function to get available amounts
async function getAvailableAmounts(provider?: string, currency?: string) {
  const giftCards = await prisma.giftCard.findMany({
    where: {
      isActive: true,
      isUsed: false,
      ...(provider && { provider: provider.toLowerCase() }),
      ...(currency && { currency: currency.toUpperCase() })
    },
    orderBy: {
      amount: 'asc'
    }
  })

  return giftCards.map(card => ({
    id: card.id,
    name: card.name,
    amount: card.amount,
    currency: card.currency,
    provider: card.provider
  }))
}

// Reserve a gift card for a payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId, giftCardId } = body

    if (!paymentId || !giftCardId) {
      return NextResponse.json(
        { error: 'Payment ID and Gift Card ID are required' },
        { status: 400 }
      )
    }

    // Reserve the gift card
    const updatedGiftCard = await prisma.giftCard.update({
      where: { id: giftCardId },
      data: {
        paymentId,
        isUsed: true
      }
    })

    // Update payment with gift card details
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        giftCardId,
        giftCardCode: updatedGiftCard.code
      },
      include: {
        giftCard: true
      }
    })

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
      giftCard: {
        id: updatedGiftCard.id,
        name: updatedGiftCard.name,
        amount: updatedGiftCard.amount,
        currency: updatedGiftCard.currency,
        provider: updatedGiftCard.provider,
        code: updatedGiftCard.code,
        pin: updatedGiftCard.pin
      }
    })
  } catch (error) {
    console.error('Error reserving gift card:', error)
    return NextResponse.json(
      { error: 'Failed to reserve gift card' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
