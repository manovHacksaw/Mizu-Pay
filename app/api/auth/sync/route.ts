import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { auth } from '@clerk/nextjs/server'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('User sync API called')
    const { userId } = await auth()
    console.log('Auth userId:', userId)
    
    if (!userId) {
      console.log('No userId found, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, name } = await request.json()
    console.log('Request data:', { email, name, clerkId: userId })

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (existingUser) {
      console.log('User already exists:', existingUser)
      return NextResponse.json({ message: 'User already exists', user: existingUser })
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        clerkId: userId,
        email,
        name,
      }
    })

    console.log('User created successfully:', user)
    return NextResponse.json({ message: 'User created successfully', user })
  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
