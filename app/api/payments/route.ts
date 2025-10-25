import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@clerk/nextjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, amount, token, store, brand, giftCardCode, status } = body

    // Validate required fields
    if (!sessionId || !amount || !token) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, amount, token' },
        { status: 400 }
      )
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        sessionId,
        amount: parseFloat(amount),
        token,
        store: store || null,
        brand: brand || null,
        giftCardCode: giftCardCode || null,
        status: status || 'PENDING',
        userId,
      },
    })

    console.log('Payment created:', payment)

    return NextResponse.json({
      success: true,
      payment,
    })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all payments for the user
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        refi: true,
      },
    })

    return NextResponse.json({
      success: true,
      payments,
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}
