import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get gift card statistics
    const giftCardStats = await prisma.giftCard.groupBy({
      by: ['provider', 'currency', 'isUsed'],
      _count: {
        id: true
      },
      _sum: {
        amount: true
      }
    })

    // Get recent payments
    const recentPayments = await prisma.payment.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        giftCard: true
      }
    })

    // Get available gift cards
    const availableGiftCards = await prisma.giftCard.findMany({
      where: {
        isActive: true,
        isUsed: false
      },
      orderBy: {
        amount: 'asc'
      },
      take: 5
    })

    return NextResponse.json({
      success: true,
      giftCardStats,
      recentPayments,
      availableGiftCards: availableGiftCards.map(card => ({
        id: card.id,
        name: card.name,
        amount: card.amount,
        currency: card.currency,
        provider: card.provider,
        code: card.code
      }))
    })
  } catch (error) {
    console.error('Error getting debug status:', error)
    return NextResponse.json(
      { error: 'Failed to get debug status' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
