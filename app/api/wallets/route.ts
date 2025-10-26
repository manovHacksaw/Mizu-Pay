import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch wallets for the authenticated user
    const wallets = await prisma.wallet.findMany({
      where: {
        userId: userId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      wallets
    })

  } catch (error: any) {
    console.error('Error fetching wallets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallets', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { address, signature } = body

    if (!address || !signature) {
      return NextResponse.json(
        { error: 'Address and signature are required' },
        { status: 400 }
      )
    }

    // Check if this wallet address already exists for this user
    const existingWallet = await prisma.wallet.findFirst({
      where: {
        address: address.toLowerCase(),
        userId: userId
      }
    })

    if (existingWallet) {
      return NextResponse.json(
        { error: 'This wallet is already connected to your account' },
        { status: 400 }
      )
    }

    // Create new wallet connection for this user
    // Note: Multiple users can have the same wallet address
    const wallet = await prisma.wallet.create({
      data: {
        address: address.toLowerCase(),
        signature: signature,
        userId: userId,
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    console.log('Wallet created for user:', { userId, address, walletId: wallet.id })

    return NextResponse.json({
      success: true,
      wallet,
      message: 'Wallet connected successfully'
    })

  } catch (error: any) {
    console.error('Error creating wallet:', error)
    return NextResponse.json(
      { error: 'Failed to create wallet', details: error.message },
      { status: 500 }
    )
  }
}
