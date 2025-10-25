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
    const { sessionId, status, txHash } = body

    if (!sessionId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, status' },
        { status: 400 }
      )
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { sessionId },
      data: {
        status,
        ...(txHash && { updatedAt: new Date() }),
      },
    })

    // If payment is completed and has a transaction hash, create ReFi contribution
    if (status === 'COMPLETED' && txHash) {
      await prisma.refiContribution.create({
        data: {
          paymentId: updatedPayment.id,
          amount: updatedPayment.amount,
          txHash,
        },
      },
    })

    console.log('Payment status updated:', updatedPayment)

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
    })
  } catch (error) {
    console.error('Error updating payment status:', error)
    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    )
  }
}
