import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/database'

export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find or create user in our database
    let user = await prisma.user.findFirst({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ wallets: [] })
    }

    const wallets = await prisma.wallet.findMany({
      where: { userId: user.id },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(wallets)
  } catch (error) {
    console.error('Error fetching wallets:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { address } = await request.json()

    if (!address || typeof address !== 'string') {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    // Basic address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: 'Invalid wallet address format' }, { status: 400 })
    }

    // Find or create user in our database
    let user = await prisma.user.findFirst({
      where: { clerkId: userId }
    })

    if (!user) {
      // Create user if doesn't exist
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: '', // We'll get this from Clerk user data if needed
          name: ''
        }
      })
    }

    // Check if wallet already exists
    const existingWallet = await prisma.wallet.findFirst({
      where: { address: address.toLowerCase() }
    })

    if (existingWallet) {
      if (existingWallet.userId === user.id) {
        return NextResponse.json({ error: 'Wallet already connected to your account' }, { status: 400 })
      } else {
        return NextResponse.json({ error: 'Wallet already connected to another account' }, { status: 400 })
      }
    }

    // Create new wallet
    const wallet = await prisma.wallet.create({
      data: {
        address: address.toLowerCase(),
        userId: user.id,
        isPrimary: false // Will be set to true if it's the first wallet
      }
    })

    // If this is the first wallet, make it primary
    const walletCount = await prisma.wallet.count({
      where: { userId: user.id }
    })

    if (walletCount === 1) {
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: { isPrimary: true }
      })
      wallet.isPrimary = true
    }

    return NextResponse.json(wallet)
  } catch (error) {
    console.error('Error adding wallet:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}