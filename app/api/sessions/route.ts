import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@clerk/nextjs/server'

const prisma = new PrismaClient()

// Create a new payment session
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, expiresInMinutes = 10 } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)

    // Create or update session
    const session = await prisma.paymentSession.upsert({
      where: { sessionId },
      update: {
        isActive: true,
        expiresAt,
        userId: user.id
      },
      create: {
        sessionId,
        isActive: true,
        expiresAt,
        userId: user.id
      }
    })

    return NextResponse.json({
      success: true,
      session,
      expiresAt: session.expiresAt
    })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Validate session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    const session = await prisma.paymentSession.findUnique({
      where: { sessionId },
      include: { user: true }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Check if session is expired
    if (new Date() > session.expiresAt || !session.isActive) {
      return NextResponse.json(
        { error: 'Session expired or inactive' },
        { status: 410 }
      )
    }

    return NextResponse.json({
      success: true,
      session,
      isValid: true,
      expiresAt: session.expiresAt
    })
  } catch (error) {
    console.error('Error validating session:', error)
    return NextResponse.json(
      { error: 'Failed to validate session' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
