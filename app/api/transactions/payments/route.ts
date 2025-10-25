import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') || ''

    const whereClause = search ? {
      OR: [
        { payer: { contains: search, mode: 'insensitive' as const } },
        { sessionId: { contains: search, mode: 'insensitive' as const } },
        { transactionHash: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {}

    const payments = await prisma.indexedPayment.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    })

    // Get store information for each payment by sessionId
    const paymentsWithStore = await Promise.all(
      payments.map(async (payment) => {
        const relatedPayment = await prisma.payment.findUnique({
          where: { sessionId: payment.sessionId },
          select: { store: true }
        })
        
        return {
          ...payment,
          store: relatedPayment?.store || 'Unknown Store'
        }
      })
    )

    const total = await prisma.indexedPayment.count({ where: whereClause })

    // Convert BigInt values to strings for JSON serialization
    const serializedPayments = paymentsWithStore.map(payment => ({
      ...payment,
      blockNumber: payment.blockNumber.toString(),
      timestamp: Number(payment.timestamp),
      amount: payment.amount.toString()
    }))

    return NextResponse.json({
      payments: serializedPayments,
      total,
      hasMore: offset + limit < total
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}
