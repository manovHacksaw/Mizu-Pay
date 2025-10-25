import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/database'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const walletId = params.id

    // Find user
    const user = await prisma.user.findFirst({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if wallet belongs to user
    const wallet = await prisma.wallet.findFirst({
      where: {
        id: walletId,
        userId: user.id
      }
    })

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    // Update all wallets to not primary
    await prisma.wallet.updateMany({
      where: { userId: user.id },
      data: { isPrimary: false }
    })

    // Set this wallet as primary
    await prisma.wallet.update({
      where: { id: walletId },
      data: { isPrimary: true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error setting primary wallet:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
