import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    // Test database connection
    const userCount = await prisma.user.count()
    console.log('User count:', userCount)
    
    return NextResponse.json({ 
      message: 'Database connection successful', 
      userCount 
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({ 
      error: 'Database connection failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
