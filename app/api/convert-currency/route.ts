import { NextRequest, NextResponse } from 'next/server'
import { convertINRToUSD, convertUSDToINR, getINRToUSDRate } from '@/lib/currency-converter'

export async function POST(request: NextRequest) {
  try {
    const { amount, fromCurrency, toCurrency } = await request.json()
    
    if (!amount || !fromCurrency || !toCurrency) {
      return NextResponse.json({ 
        error: 'Missing required fields: amount, fromCurrency, toCurrency' 
      }, { status: 400 })
    }
    
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ 
        error: 'Amount must be a positive number' 
      }, { status: 400 })
    }
    
    let convertedAmount: number
    let exchangeRate: number
    
    if (fromCurrency.toUpperCase() === 'INR' && toCurrency.toUpperCase() === 'USD') {
      convertedAmount = await convertINRToUSD(amount)
      exchangeRate = await getINRToUSDRate()
    } else if (fromCurrency.toUpperCase() === 'USD' && toCurrency.toUpperCase() === 'INR') {
      convertedAmount = await convertUSDToINR(amount)
      exchangeRate = 1 / await getINRToUSDRate()
    } else {
      return NextResponse.json({ 
        error: 'Unsupported currency conversion. Only INR ↔ USD is supported.' 
      }, { status: 400 })
    }
    
    return NextResponse.json({
      originalAmount: amount,
      originalCurrency: fromCurrency.toUpperCase(),
      convertedAmount,
      convertedCurrency: toCurrency.toUpperCase(),
      exchangeRate,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Currency conversion error:', error)
    return NextResponse.json({ 
      error: 'Internal server error during currency conversion' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const amount = parseFloat(searchParams.get('amount') || '0')
    const fromCurrency = searchParams.get('from') || 'INR'
    const toCurrency = searchParams.get('to') || 'USD'
    
    if (amount <= 0) {
      return NextResponse.json({ 
        error: 'Amount must be a positive number' 
      }, { status: 400 })
    }
    
    let convertedAmount: number
    let exchangeRate: number
    
    if (fromCurrency.toUpperCase() === 'INR' && toCurrency.toUpperCase() === 'USD') {
      convertedAmount = await convertINRToUSD(amount)
      exchangeRate = await getINRToUSDRate()
    } else if (fromCurrency.toUpperCase() === 'USD' && toCurrency.toUpperCase() === 'INR') {
      convertedAmount = await convertUSDToINR(amount)
      exchangeRate = 1 / await getINRToUSDRate()
    } else {
      return NextResponse.json({ 
        error: 'Unsupported currency conversion. Only INR ↔ USD is supported.' 
      }, { status: 400 })
    }
    
    return NextResponse.json({
      originalAmount: amount,
      originalCurrency: fromCurrency.toUpperCase(),
      convertedAmount,
      convertedCurrency: toCurrency.toUpperCase(),
      exchangeRate,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Currency conversion error:', error)
    return NextResponse.json({ 
      error: 'Internal server error during currency conversion' 
    }, { status: 500 })
  }
}
