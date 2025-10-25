import { NextRequest, NextResponse } from 'next/server'
import { sendPaymentConfirmationEmail } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { userEmail, userName, amount, token, store, product, sessionId, txHash } = await request.json()
    
    if (!userEmail || !amount || !token || !sessionId || !txHash) {
      return NextResponse.json({ 
        error: 'Missing required fields: userEmail, amount, token, sessionId, txHash' 
      }, { status: 400 })
    }

    console.log('📧 Sending payment confirmation email...', {
      userEmail,
      userName,
      amount,
      token,
      store,
      product,
      sessionId,
      txHash
    })

    const result = await sendPaymentConfirmationEmail({
      userEmail,
      userName: userName || 'Valued Customer',
      amount,
      token,
      store: store || 'N/A',
      product: product || 'N/A',
      sessionId,
      txHash
    })

    if (result.success) {
      return NextResponse.json({ 
        message: 'Email sent successfully',
        success: true 
      })
    } else {
      return NextResponse.json({ 
        error: result.message,
        success: false 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Error in send-email API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      success: false 
    }, { status: 500 })
  }
}
