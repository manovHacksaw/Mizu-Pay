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
        { to: { contains: search, mode: 'insensitive' as const } },
        { transactionHash: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {}

    const withdrawals = await prisma.indexedWithdrawal.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await prisma.indexedWithdrawal.count({ where: whereClause })

    // Convert BigInt values to strings for JSON serialization
    const serializedWithdrawals = withdrawals.map(withdrawal => ({
      ...withdrawal,
      blockNumber: withdrawal.blockNumber.toString(),
      timestamp: Number(withdrawal.timestamp),
      amount: withdrawal.amount.toString()
    }))

    return NextResponse.json({
      withdrawals: serializedWithdrawals,
      total,
      hasMore: offset + limit < total
    })
  } catch (error) {
    console.error('Error fetching withdrawals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch withdrawals' },
      { status: 500 }
    )
  }
}
