'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, RefreshCw, ExternalLink, User, DollarSign, Clock } from 'lucide-react'

interface IndexedPayment {
  id: string
  payer: string
  amount: string
  currency: string
  sessionId: string
  timestamp: number
  blockNumber: string
  transactionHash: string
  logIndex: number
  createdAt: string
}

interface IndexedWithdrawal {
  id: string
  to: string
  amount: string
  currency: string
  timestamp: number
  blockNumber: string
  transactionHash: string
  logIndex: number
  createdAt: string
}

interface GlobalStats {
  totalPayments: number
  totalVolume: string
  uniqueUsers: number
}

export default function TransactionsPage() {
  const [payments, setPayments] = useState<IndexedPayment[]>([])
  const [withdrawals, setWithdrawals] = useState<IndexedWithdrawal[]>([])
  const [stats, setStats] = useState<GlobalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'payments' | 'withdrawals'>('all')
  const [sortBy, setSortBy] = useState<'timestamp' | 'amount'>('timestamp')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    fetchTransactions()
    // Set up polling for real-time updates
    const interval = setInterval(fetchTransactions, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      
      // Fetch payments from Envio indexer
      const paymentsResponse = await fetch('/api/transactions/payments')
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json()
        setPayments(paymentsData.payments || [])
      }

      // Fetch withdrawals from Envio indexer
      const withdrawalsResponse = await fetch('/api/transactions/withdrawals')
      if (withdrawalsResponse.ok) {
        const withdrawalsData = await withdrawalsResponse.json()
        setWithdrawals(withdrawalsData.withdrawals || [])
      }

      // Fetch global stats from Envio indexer
      const statsResponse = await fetch('/api/transactions/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
      }
      
      // Update last update time
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching transactions:', error)
      // If API fails, show empty state
      setPayments([])
      setWithdrawals([])
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatBigIntAmount = (amount: string, decimals: number = 2) => {
    const bigIntAmount = BigInt(amount)
    const divisor = BigInt(10 ** 18)
    const wholePart = bigIntAmount / divisor
    const fractionalPart = bigIntAmount % divisor
    const fractionalDecimal = Number(fractionalPart) / 1e18
    const totalAmount = Number(wholePart) + fractionalDecimal
    return totalAmount.toFixed(decimals)
  }

  const formatAmount = (amount: string, currency: string) => {
    // Convert wei to token units (divide by 10^18)
    const weiAmount = BigInt(amount)
    const tokenAmount = Number(weiAmount) / 1e18
    
    if (currency === 'CUSD') {
      return `${tokenAmount.toFixed(2)} cUSD`
    } else if (currency === 'CELO') {
      return `${tokenAmount.toFixed(4)} CELO`
    }
    return `${tokenAmount.toFixed(2)} ${currency}`
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Blockchain Transactions</h1>
          <p className="text-gray-300">Real-time indexed transactions from MizuPay contract</p>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${payments.length > 0 || withdrawals.length > 0 ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              <span className="text-sm text-gray-300">
                {payments.length > 0 || withdrawals.length > 0 ? 'Indexer Active' : 'Waiting for transactions...'}
              </span>
            </div>
            <div className="text-sm text-gray-400">
              Contract: 0x6aE731EbaC64f1E9c6A721eA2775028762830CF7
            </div>
            <div className="text-sm text-blue-400">
              🔄 Real-time monitoring active
            </div>
          </div>
        </div>

        {/* Real-time Status Banner */}
        {lastUpdate && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-400/30 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 text-sm font-medium">Real-time monitoring active</span>
              <span className="text-green-400/70 text-xs ml-auto">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
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
                  {formatBigIntAmount(stats.totalVolume, 2)} cUSD
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
        )}

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
            onClick={fetchTransactions}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
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
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400">From:</span>
                                <span className="text-sm text-blue-400 font-mono">{formatAddress(payment.payer)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400">Session:</span>
                                <span className="text-sm text-purple-400 font-mono bg-gray-700 px-2 py-1 rounded text-xs">{payment.sessionId}</span>
                              </div>
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
                            <div className="mt-2 text-xs text-gray-500 font-mono">
                              Tx: {payment.transactionHash.slice(0, 20)}...
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
