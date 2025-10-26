import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, limit = 10 } = await request.json()

    console.log('MOCK Envio indexer received transaction request:', { walletAddress, limit })

    // Mock recent transactions data
    const mockTransactions = [
      {
        id: 'tx_001',
        txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        from: walletAddress,
        to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amount: '25.50',
        token: 'CUSD',
        status: 'CONFIRMED',
        blockNumber: 12345678,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        gasUsed: '21000',
        gasPrice: '20000000000',
        value: '25500000000000000000'
      },
      {
        id: 'tx_002',
        txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        from: walletAddress,
        to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amount: '15.75',
        token: 'CELO',
        status: 'CONFIRMED',
        blockNumber: 12345675,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        gasUsed: '25000',
        gasPrice: '18000000000',
        value: '15750000000000000000'
      },
      {
        id: 'tx_003',
        txHash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
        from: walletAddress,
        to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amount: '100.00',
        token: 'CUSD',
        status: 'CONFIRMED',
        blockNumber: 12345670,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        gasUsed: '30000',
        gasPrice: '15000000000',
        value: '100000000000000000000'
      },
      {
        id: 'tx_004',
        txHash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
        from: walletAddress,
        to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amount: '50.25',
        token: 'CUSD',
        status: 'PENDING',
        blockNumber: 12345680,
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        gasUsed: '22000',
        gasPrice: '20000000000',
        value: '50250000000000000000'
      }
    ]

    // Filter transactions based on limit
    const limitedTransactions = mockTransactions.slice(0, parseInt(limit.toString()))

    return NextResponse.json({
      success: true,
      transactions: limitedTransactions,
      walletAddress,
      totalCount: limitedTransactions.length
    })

  } catch (error: any) {
    console.error('Error in mock Envio transactions:', error)
    return NextResponse.json(
      { error: 'Mock Envio transactions failed', details: error.message },
      { status: 500 }
    )
  }
}
