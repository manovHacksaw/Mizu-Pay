import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/database'

export async function DELETE(
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

    // Delete the wallet
    await prisma.wallet.delete({
      where: { id: walletId }
    })

    // If this was the primary wallet, set another one as primary
    if (wallet.isPrimary) {
      const remainingWallets = await prisma.wallet.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' }
      })

      if (remainingWallets.length > 0) {
        await prisma.wallet.update({
          where: { id: remainingWallets[0].id },
          data: { isPrimary: true }
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting wallet:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
