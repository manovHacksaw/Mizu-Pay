import { NextRequest, NextResponse } from 'next/server'
import { sendGiftCardDetailsEmail } from '@/lib/email-service-enhanced'

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Gift card email API called')
    const body = await request.json()
    console.log('📧 Request body:', body)
    const {
      userEmail,
      userName,
      giftCardName,
      giftCardAmount,
      giftCardCurrency,
      giftCardProvider,
      giftCardCode,
      giftCardPin,
      paymentAmount,
      paymentToken,
      txHash
    } = body

    // Validate required fields
    if (!userEmail || !giftCardCode) {
      return NextResponse.json(
        { error: 'Missing required fields: userEmail, giftCardCode' },
        { status: 400 }
      )
    }

    const emailData = {
      userEmail,
      userName: userName || 'Valued Customer',
      giftCardName: giftCardName || 'Gift Card',
      giftCardAmount: giftCardAmount || 0,
      giftCardCurrency: giftCardCurrency || 'USD',
      giftCardProvider: giftCardProvider || 'store',
      giftCardCode,
      giftCardPin: giftCardPin || undefined,
      paymentAmount: paymentAmount || 0,
      paymentToken: paymentToken || 'CUSD',
      txHash: txHash || ''
    }

    console.log('📧 Sending gift card email with data:', emailData)
    
    try {
      const result = await sendGiftCardDetailsEmail(emailData)
      console.log('📧 Email result:', result)
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: 'Gift card details email sent successfully',
          data: result.data
        })
      } else {
        console.error('❌ Email sending failed:', result.message)
        return NextResponse.json(
          { error: result.message },
          { status: 500 }
        )
      }
    } catch (emailError) {
      console.error('❌ Email service error:', emailError)
      return NextResponse.json(
        { error: 'Email service failed', details: emailError.message },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error sending gift card email:', error)
    return NextResponse.json(
      { error: 'Failed to send gift card email' },
      { status: 500 }
    )
  }
}
