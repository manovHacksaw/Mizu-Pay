import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@clerk/nextjs/server'
import { verifyWalletOwnership } from '@/lib/wallet-verification'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('Wallet API called')
    const { userId } = await auth()
    console.log('Auth userId:', userId)
    
    if (!userId) {
      console.log('No userId found, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { address, signature, message } = await request.json()
    console.log('Wallet data:', { address, signature, userId })

    if (!address || !signature) {
      return NextResponse.json({ error: 'Wallet address and signature are required' }, { status: 400 })
    }

    // Verify wallet ownership using signature
    const messageToVerify = message || `Connect wallet to Mizu-Pay: ${address}`
    const isValidSignature = await verifyWalletOwnership(address, messageToVerify, signature)
    
    if (!isValidSignature) {
      return NextResponse.json({ error: 'Invalid signature. Please sign the message with your wallet.' }, { status: 400 })
    }

    // Check if wallet already exists
    const existingWallet = await prisma.wallet.findUnique({
      where: { address }
    })

    if (existingWallet) {
      console.log('Wallet already exists:', existingWallet)
      
      // Check if wallet belongs to current user
      if (existingWallet.userId === user.id) {
        return NextResponse.json({ message: 'Wallet already connected to your account', wallet: existingWallet })
      } else {
        return NextResponse.json({ error: 'Wallet is already connected to another account' }, { status: 400 })
      }
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create new wallet
    const wallet = await prisma.wallet.create({
      data: {
        address,
        userId: user.id,
        isPrimary: true, // First wallet is primary
      }
    })

    console.log('Wallet created successfully:', wallet)
    return NextResponse.json({ message: 'Wallet saved successfully', wallet })
  } catch (error) {
    console.error('Error saving wallet:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's wallets
    const wallets = await prisma.wallet.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ wallets })
  } catch (error) {
    console.error('Error fetching wallets:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}