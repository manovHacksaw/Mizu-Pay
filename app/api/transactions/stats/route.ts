import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET() {
  try {
    // Get or create global stats
    let stats = await prisma.globalStats.findUnique({
      where: { id: 'main' }
    })

    if (!stats) {
      // Initialize with zero values if no stats exist
      stats = await prisma.globalStats.create({
        data: {
          id: 'main',
          totalPayments: 0,
          totalVolume: '0',
          uniqueUsers: 0
        }
      })
    }

    // Convert BigInt values to strings for JSON serialization
    const serializedStats = {
      ...stats,
      totalVolume: stats.totalVolume.toString()
    }

    return NextResponse.json({ stats: serializedStats })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
