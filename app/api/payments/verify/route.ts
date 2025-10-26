import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { auth } from '@clerk/nextjs/server'

// Verify payment and process gift card
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, txHash, walletAddress } = body

    if (!sessionId || !txHash || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, txHash, walletAddress' },
        { status: 400 }
      )
    }

    // Get payment record
    const payment = await prisma.payment.findUnique({
      where: { sessionId },
      include: { user: true }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Verify the transaction matches the connected wallet
    // This would typically involve checking the blockchain transaction
    // For now, we'll simulate the verification
    const isTransactionValid = await verifyTransactionOnBlockchain(txHash, walletAddress, payment.amount, payment.token)
    
    if (!isTransactionValid) {
      return NextResponse.json(
        { error: 'Transaction verification failed' },
        { status: 400 }
      )
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { sessionId },
      data: {
        status: 'VERIFIED',
        txHash
      }
    })

    // Find and reserve appropriate gift card
    console.log('Finding gift card for payment:', {
      amount: payment.amount,
      store: payment.store,
      brand: payment.brand
    })
    
    const giftCard = await findAndReserveGiftCard(payment.amount, payment.store, payment.brand)
    
    if (!giftCard) {
      console.error('No suitable gift card found for:', {
        amount: payment.amount,
        store: payment.store,
        brand: payment.brand
      })
      return NextResponse.json(
        { error: 'No suitable gift card available' },
        { status: 400 }
      )
    }
    
    console.log('Gift card found and reserved:', giftCard)

    // Link gift card to payment
    const finalPayment = await prisma.payment.update({
      where: { sessionId },
      data: {
        giftCard: {
          connect: { id: giftCard.id }
        },
        giftCardCode: giftCard.code,
        status: 'COMPLETED'
      }
    })

    // Update the gift card with payment reference
    await prisma.giftCard.update({
      where: { id: giftCard.id },
      data: {
        paymentId: finalPayment.id,
        isUsed: true
      }
    })

    return NextResponse.json({
      success: true,
      payment: finalPayment,
      giftCard: {
        id: giftCard.id,
        name: giftCard.name,
        amount: giftCard.amount,
        currency: giftCard.currency,
        provider: giftCard.provider,
        code: giftCard.code,
        pin: giftCard.pin
      }
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}

// Simulate blockchain transaction verification
async function verifyTransactionOnBlockchain(txHash: string, walletAddress: string, amount: number, token: string): Promise<boolean> {
  // In a real implementation, this would:
  // 1. Fetch the transaction from the blockchain
  // 2. Verify the sender matches the walletAddress
  // 3. Verify the amount matches
  // 4. Verify the token matches
  // 5. Verify the transaction is confirmed
  
  console.log('Verifying transaction:', { txHash, walletAddress, amount, token })
  
  // For now, return true to simulate successful verification
  // In production, implement actual blockchain verification
  return true
}

// Find and reserve appropriate gift card
async function findAndReserveGiftCard(amount: number, store?: string, brand?: string) {
  try {
    // Check if prisma client is properly initialized
    if (!prisma || !prisma.giftCard) {
      console.error('Prisma client not properly initialized')
      console.error('Prisma client:', !!prisma)
      console.error('Prisma giftCard:', !!prisma?.giftCard)
      return null
    }

    // Determine provider based on store/brand with fuzzy matching
    let provider = 'amazon' // default
    let currency = 'USD' // default
    
    if (store) {
      const storeLower = store.toLowerCase()
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

    console.log('Searching for gift card with criteria:', {
      amount,
      provider,
      currency,
      store,
      brand
    })

    // First try to find exact provider match
    let giftCard = await prisma.giftCard.findFirst({
      where: {
        isActive: true,
        isUsed: false,
        amount: {
          gte: amount
        },
        provider: provider.toLowerCase(),
        currency: currency
      },
      orderBy: {
        amount: 'asc'
      }
    })

    // If no exact match, try fuzzy matching based on store name
    if (!giftCard) {
      console.log('No exact provider match, trying fuzzy matching...')
      const nameKeywords = provider.toLowerCase()
      
      giftCard = await prisma.giftCard.findFirst({
        where: {
          isActive: true,
          isUsed: false,
          amount: {
            gte: amount
          },
          currency: currency,
          OR: [
            { provider: { contains: nameKeywords } },
            { name: { contains: nameKeywords } }
          ]
        },
        orderBy: {
          amount: 'asc'
        }
      })
    }

    // If still no match, try any available gift card
    if (!giftCard) {
      console.log('No fuzzy match, trying any available gift card')
      giftCard = await prisma.giftCard.findFirst({
        where: {
          isActive: true,
          isUsed: false,
          amount: {
            gte: amount
          }
        },
        orderBy: {
          amount: 'asc'
        }
      })
    }

    // If still no match, try any gift card regardless of amount
    if (!giftCard) {
      console.log('No gift card with sufficient amount, trying any available')
      giftCard = await prisma.giftCard.findFirst({
        where: {
          isActive: true,
          isUsed: false
        },
        orderBy: {
          amount: 'asc'
        }
      })
    }

    if (!giftCard) {
      console.error('No gift cards available at all')
      return null
    }

    console.log('Found gift card:', {
      id: giftCard.id,
      name: giftCard.name,
      amount: giftCard.amount,
      provider: giftCard.provider,
      currency: giftCard.currency
    })

    // Reserve the gift card
    const reservedGiftCard = await prisma.giftCard.update({
      where: { id: giftCard.id },
      data: {
        isUsed: true
      }
    })

    return reservedGiftCard
  } catch (error) {
    console.error('Error in findAndReserveGiftCard:', error)
    return null
  }
}
