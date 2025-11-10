import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * GET /api/users/currency
 * Get user's default currency
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { defaultCurrency: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      defaultCurrency: user.defaultCurrency || null,
    });
  } catch (error) {
    console.error('Error fetching user currency:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users/currency
 * Update user's default currency
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, defaultCurrency } = body;

    if (!email || !defaultCurrency) {
      return NextResponse.json(
        { error: 'Email and defaultCurrency are required' },
        { status: 400 }
      );
    }

    if (defaultCurrency !== 'INR' && defaultCurrency !== 'USD') {
      return NextResponse.json(
        { error: 'Invalid currency. Supported: INR, USD' },
        { status: 400 }
      );
    }

    // Use upsert to create user if they don't exist, or update if they do
    const user = await prisma.user.upsert({
      where: { email },
      update: { defaultCurrency },
      create: {
        email,
        defaultCurrency,
      },
      select: { id: true, email: true, defaultCurrency: true },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        defaultCurrency: user.defaultCurrency,
      },
    });
  } catch (error) {
    console.error('Error updating user currency:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

