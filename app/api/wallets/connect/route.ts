import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/database'
import { SiweMessage } from 'siwe'
import { verifySiweMessage } from '@/lib/wallet-verification'

export async function POST(request: NextRequest) {
  try {
    console.log('Wallet connect API called')
    const { userId } = auth()
    console.log('User ID:', userId)
    
    if (!userId) {
      console.log('No user ID found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { address, message, signature } = await request.json()
    console.log('Received data:', { address, message: message?.substring(0, 50) + '...', signature: signature?.substring(0, 20) + '...' })

    if (!address || !message || !signature) {
      console.log('Missing required fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify the SIWE message
    console.log('Verifying SIWE message...')
    
    try {
      // First verify using our custom function
      const isValidSiwe = await verifySiweMessage(message, signature, address)
      if (!isValidSiwe) {
        return NextResponse.json({ error: 'Invalid SIWE message or signature' }, { status: 400 })
      }
      
      // Also verify using the SIWE library for additional validation
      const siweMessage = new SiweMessage(message)
      const result = await siweMessage.verify({ signature })
      console.log('SIWE verification result:', result)
    } catch (error) {
      console.error('SIWE verification failed:', error)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Find user in our database (should exist from UserSync)
    let user = await prisma.user.findFirst({
      where: { clerkId: userId }
    })

    if (!user) {
      console.log('User not found in database, creating...')
      // Create user if doesn't exist (fallback)
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: 'unknown@example.com', // Fallback
          name: 'Unknown User'
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
    console.error('Error connecting wallet:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
