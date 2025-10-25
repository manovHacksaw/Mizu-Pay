import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user already exists
    let user = await prisma.user.findFirst({
      where: { clerkId: userId }
    })

    if (user) {
      // Update existing user with latest info
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          email: email,
          name: name || email.split('@')[0]
        }
      })
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: email,
          name: name || email.split('@')[0]
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
