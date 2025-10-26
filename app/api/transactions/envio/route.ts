import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')
    const limit = searchParams.get('limit') || '10'

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Call Envio indexer to get recent transactions
    const envioUrl = process.env.ENVIO_INDEXER_URL || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/transactions/latest`
    
    const envioResponse = await fetch(envioUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress,
        limit: parseInt(limit)
      })
    })

    if (!envioResponse.ok) {
      console.error('❌ Envio indexer response not ok:', envioResponse.status)
      return NextResponse.json(
        { error: 'Failed to fetch transactions from Envio indexer', status: envioResponse.status },
        { status: 500 }
      )
    }

    const envioData = await envioResponse.json()
    console.log('📊 Envio transactions response:', envioData)

    if (!envioData || !envioData.transactions) {
      console.error('❌ Empty or invalid response from Envio indexer')
      return NextResponse.json(
        { error: 'Invalid response from Envio indexer' },
        { status: 500 }
      )
    }

    // Process and format the transactions
    const transactions = envioData.transactions.map((tx: any) => ({
      id: tx.id || tx.txHash,
      txHash: tx.txHash,
      from: tx.from,
      to: tx.to,
      amount: tx.amount,
      token: tx.token || 'CUSD',
      status: tx.status || 'CONFIRMED',
      blockNumber: tx.blockNumber,
      timestamp: tx.timestamp || tx.createdAt,
      gasUsed: tx.gasUsed,
      gasPrice: tx.gasPrice,
      value: tx.value
    }))

    return NextResponse.json({
      success: true,
      transactions,
      summary: {
        totalTransactions: transactions.length,
        totalVolume: transactions.reduce((sum: number, tx: any) => sum + parseFloat(tx.amount || 0), 0),
        confirmedTransactions: transactions.filter((tx: any) => tx.status === 'CONFIRMED').length
      }
    })

  } catch (error: any) {
    console.error('Error fetching Envio transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions from Envio', details: error.message },
      { status: 500 }
    )
  }
}
