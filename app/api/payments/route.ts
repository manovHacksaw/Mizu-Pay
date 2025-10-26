import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Fetching payments for userId:', userId)

    // First, let's check if the user exists in our database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      console.log('❌ User not found in database for clerkId:', userId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('✅ User found in database:', user.id)

    // Fetch payments for the authenticated user using the database userId
    const payments = await prisma.payment.findMany({
      where: {
        userId: user.id
      },
      include: {
        giftCard: true,
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
      },
      take: 50 // Limit to last 50 payments
    })

    // Calculate summary statistics
    const totalPayments = payments.length
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const completedPayments = payments.filter(p => p.status === 'COMPLETED').length
    const pendingPayments = payments.filter(p => p.status === 'PENDING').length

    return NextResponse.json({
      success: true,
      payments,
      summary: {
        totalPayments,
        totalAmount,
        completedPayments,
        pendingPayments
      }
    })

  } catch (error: any) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments', details: error.message },
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
    const { 
      sessionId, 
      amount, 
      token, 
      store, 
      brand, 
      giftCardCode, 
      status, 
      txHash
    } = body

    if (!sessionId || !amount || !token) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, amount, token' },
        { status: 400 }
      )
    }

    // First, get the database user ID from Clerk user ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('💳 Creating payment for user:', user.id)

    // Create new payment record
    const payment = await prisma.payment.create({
      data: {
        sessionId,
        amount: parseFloat(amount),
        token,
        store: store || null,
        brand: brand || null,
        giftCardCode: giftCardCode || null,
        status: status || 'PENDING',
        txHash: txHash || null,
        userId: user.id // Use database user ID
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

    console.log('Payment created:', payment)

    return NextResponse.json({
      success: true,
      payment,
      message: 'Payment created successfully'
    })

  } catch (error: any) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment', details: error.message },
      { status: 500 }
    )
  }
}