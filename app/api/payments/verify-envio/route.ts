import { NextRequest, NextResponse } from 'next/server'

// Verify payment using Envio indexer
export async function POST(request: NextRequest) {
  try {
    const { txHash, walletAddress, amount, token } = await request.json()

    console.log('🔍 Verifying payment with Envio indexer:', {
      txHash,
      walletAddress,
      amount,
      token
    })

    // Call Envio indexer to get the latest payment
    const indexerUrl = process.env.ENVIO_INDEXER_URL || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/latest`
    const indexerResponse = await fetch(indexerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        txHash,
        walletAddress,
        amount,
        token
      })
    })

    if (!indexerResponse.ok) {
      console.error('❌ Envio indexer response not ok:', indexerResponse.status, indexerResponse.statusText)
      return NextResponse.json(
        { error: 'Failed to verify payment with indexer', status: indexerResponse.status },
        { status: 500 }
      )
    }

    const indexerData = await indexerResponse.json()
    console.log('📊 Envio indexer response:', indexerData)
    
    if (!indexerData) {
      console.error('❌ Empty response from indexer')
      return NextResponse.json(
        { error: 'Empty response from indexer' },
        { status: 500 }
      )
    }

    // Check if payment is verified by indexer
    if (indexerData.verified && indexerData.payment) {
      console.log('✅ Payment verified by Envio indexer')
      
      return NextResponse.json({
        success: true,
        verified: true,
        payment: indexerData.payment,
        message: 'Payment verified successfully'
      })
    } else {
      console.log('❌ Payment not verified by indexer')
      
      return NextResponse.json({
        success: false,
        verified: false,
        message: 'Payment not found or not verified by indexer'
      })
    }

  } catch (error) {
    console.error('❌ Error verifying payment with Envio indexer:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment with indexer', details: error.message },
      { status: 500 }
    )
  }
}
