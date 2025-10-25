'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, RefreshCw, ExternalLink, User, DollarSign, Clock } from 'lucide-react'

// Mock data for demonstration
const mockPayments = [
  {
    id: '0x1234567890abcdef-1',
    payer: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    amount: '1000000000000000000', // 1 CUSD in wei
    currency: 'CUSD',
    sessionId: 'session_001',
    timestamp: 1704067200,
    blockNumber: '12345678',
    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    logIndex: 1,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '0x1234567890abcdef-2',
    payer: '0x8ba1f109551bD432803012645Hac136c',
    amount: '500000000000000000', // 0.5 CUSD in wei
    currency: 'CUSD',
    sessionId: 'session_002',
    timestamp: 1704070800,
    blockNumber: '12345679',
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    logIndex: 2,
    createdAt: '2024-01-01T01:00:00Z'
  }
]

const mockWithdrawals = [
  {
    id: '0x9876543210fedcba-1',
    to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    amount: '2000000000000000000', // 2 CUSD in wei
    currency: 'CUSD',
    timestamp: 1704074400,
    blockNumber: '12345680',
    transactionHash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
    logIndex: 3,
    createdAt: '2024-01-01T02:00:00Z'
  }
]

const mockStats = {
  totalPayments: 2,
  totalVolume: '1500000000000000000', // 1.5 CUSD in wei
  uniqueUsers: 2
}

export default function TransactionsSimplePage() {
  const [payments, setPayments] = useState(mockPayments)
  const [withdrawals, setWithdrawals] = useState(mockWithdrawals)
  const [stats, setStats] = useState(mockStats)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'payments' | 'withdrawals'>('all')
  const [sortBy, setSortBy] = useState<'timestamp' | 'amount'>('timestamp')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatAmount = (amount: string, currency: string) => {
    const numAmount = parseFloat(amount)
    if (currency === 'CUSD') {
      return `${(numAmount / 1e18).toFixed(2)} cUSD`
    } else if (currency === 'CELO') {
      return `${(numAmount / 1e18).toFixed(4)} CELO`
    }
    return `${numAmount} ${currency}`
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const getExplorerUrl = (txHash: string) => {
    return `https://sepolia.celoscan.io/tx/${txHash}`
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.payer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionHash.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const matchesSearch = withdrawal.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         withdrawal.transactionHash.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const sortedPayments = [...filteredPayments].sort((a, b) => {
    if (sortBy === 'timestamp') {
      return sortOrder === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp
    } else {
      const aAmount = parseFloat(a.amount)
      const bAmount = parseFloat(b.amount)
      return sortOrder === 'asc' ? aAmount - bAmount : bAmount - aAmount
    }
  })

  const sortedWithdrawals = [...filteredWithdrawals].sort((a, b) => {
    if (sortBy === 'timestamp') {
      return sortOrder === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp
    } else {
      const aAmount = parseFloat(a.amount)
      const bAmount = parseFloat(b.amount)
      return sortOrder === 'asc' ? aAmount - bAmount : bAmount - aAmount
    }
  })

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Blockchain Transactions</h1>
          <p className="text-gray-300">Real-time indexed transactions from MizuPay contract</p>
          <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
            <p className="text-yellow-300 text-sm">
              <strong>Demo Mode:</strong> This page shows sample data. To see real transactions, set up the Envio indexer.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalPayments}</div>
              <p className="text-xs text-gray-400">All time payments</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Volume</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatAmount(stats.totalVolume, 'CUSD')}
              </div>
              <p className="text-xs text-gray-400">Total transaction volume</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Unique Users</CardTitle>
              <User className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.uniqueUsers}</div>
              <p className="text-xs text-gray-400">Unique wallet addresses</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by address, session ID, or transaction hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>
          </div>
          
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="payments">Payments Only</SelectItem>
              <SelectItem value="withdrawals">Withdrawals Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timestamp">Time</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>

          <Button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Transactions List */}
        <div className="space-y-6">
          {/* Payments */}
          {(filterType === 'all' || filterType === 'payments') && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <DollarSign className="h-6 w-6 mr-2 text-green-400" />
                Payments ({sortedPayments.length})
              </h2>
              
              {sortedPayments.length === 0 ? (
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-400">No payments found</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sortedPayments.map((payment) => (
                    <Card key={payment.id} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                                Payment
                              </Badge>
                              <span className="text-sm text-gray-400">
                                From: {formatAddress(payment.payer)}
                              </span>
                              <span className="text-sm text-gray-400">
                                Session: {payment.sessionId}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-6 text-sm">
                              <div>
                                <span className="text-gray-400">Amount: </span>
                                <span className="text-white font-semibold">
                                  {formatAmount(payment.amount, payment.currency)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">Block: </span>
                                <span className="text-white">{payment.blockNumber}</span>
                              </div>
                              <div className="flex items-center text-gray-400">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatTimestamp(payment.timestamp)}
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(getExplorerUrl(payment.transactionHash), '_blank')}
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View on Explorer
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Withdrawals */}
          {(filterType === 'all' || filterType === 'withdrawals') && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <DollarSign className="h-6 w-6 mr-2 text-red-400" />
                Withdrawals ({sortedWithdrawals.length})
              </h2>
              
              {sortedWithdrawals.length === 0 ? (
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-400">No withdrawals found</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sortedWithdrawals.map((withdrawal) => (
                    <Card key={withdrawal.id} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <Badge variant="secondary" className="bg-red-500/20 text-red-300">
                                Withdrawal
                              </Badge>
                              <span className="text-sm text-gray-400">
                                To: {formatAddress(withdrawal.to)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-6 text-sm">
                              <div>
                                <span className="text-gray-400">Amount: </span>
                                <span className="text-white font-semibold">
                                  {formatAmount(withdrawal.amount, withdrawal.currency)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">Block: </span>
                                <span className="text-white">{withdrawal.blockNumber}</span>
                              </div>
                              <div className="flex items-center text-gray-400">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatTimestamp(withdrawal.timestamp)}
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(getExplorerUrl(withdrawal.transactionHash), '_blank')}
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View on Explorer
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
