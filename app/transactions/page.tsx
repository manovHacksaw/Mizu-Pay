'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, RefreshCw, ExternalLink, User, DollarSign, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ShaderBackground } from '@/components/ui/infinite-hero'

// Skeleton Loader Components
const SkeletonCard = () => (
    <Card className="p-6 rounded-2xl bg-black/20 backdrop-blur-2xl border border-white/10 shadow-2xl">
        <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
                <div className="h-5 bg-white/20 rounded w-32 animate-pulse"></div>
                <div className="h-5 w-5 bg-white/20 rounded animate-pulse"></div>
            </div>
            <div className="mb-2">
                <div className="h-8 bg-white/20 rounded w-24 animate-pulse"></div>
            </div>
            <div className="h-4 bg-white/20 rounded w-20 animate-pulse"></div>
        </CardContent>
    </Card>
)

const SkeletonTransactionCard = () => (
    <Card className="p-6 rounded-2xl bg-black/20 backdrop-blur-2xl border border-white/10 shadow-2xl">
        <CardContent className="p-0">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-6 bg-white/20 rounded w-16 animate-pulse"></div>
                        <div className="h-4 bg-white/20 rounded w-24 animate-pulse"></div>
                        <div className="h-4 bg-white/20 rounded w-20 animate-pulse"></div>
                        <div className="h-4 bg-white/20 rounded w-32 animate-pulse"></div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                        <div className="h-4 bg-white/20 rounded w-20 animate-pulse"></div>
                        <div className="h-4 bg-white/20 rounded w-16 animate-pulse"></div>
                        <div className="h-4 bg-white/20 rounded w-24 animate-pulse"></div>
                    </div>
                    <div className="mt-2 h-3 bg-white/20 rounded w-40 animate-pulse"></div>
                </div>
                <div className="h-8 bg-white/20 rounded w-24 animate-pulse"></div>
            </div>
        </CardContent>
    </Card>
)

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
 }, [])

 const fetchTransactions = async () => {
 setLoading(true)
 
 // Simple fetch without complex processing
 const paymentsResponse = await fetch('/api/transactions/payments')
 const withdrawalsResponse = await fetch('/api/transactions/withdrawals')
 const statsResponse = await fetch('/api/transactions/stats')

 if (paymentsResponse.ok) {
 const paymentsData = await paymentsResponse.json()
 setPayments(paymentsData.payments || [])
 }

 if (withdrawalsResponse.ok) {
 const withdrawalsData = await withdrawalsResponse.json()
 setWithdrawals(withdrawalsData.withdrawals || [])
 }

 if (statsResponse.ok) {
 const statsData = await statsResponse.json()
 setStats(statsData.stats)
 }
 
 setLastUpdate(new Date())
 setLoading(false)
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

 // Animation variants for Framer Motion
 const containerVariants = {
 hidden: { opacity: 0, y: 20 },
 visible: {
 opacity: 1,
 y: 0,
 transition: {
 staggerChildren: 0.1,
 },
 },
 };

 const itemVariants = {
 hidden: { opacity: 0, y: 15 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
 };

    const hoverTransition = { type: "spring" as const, stiffness: 300, damping: 15 };

 if (loading) {
 return (
 <div className="min-h-screen bg-black text-white relative overflow-hidden">
                {/* Animated Background */}
 <div className="absolute inset-0">
  <ShaderBackground className="h-full w-full" />
 </div>
 <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-gray-900/60 to-black/80">
  <div className="absolute inset-0 [background:radial-gradient(120%_80%_at_50%_50%,_transparent_40%,_black_100%)]" />
 </div>

                {/* Header - Glass Morphism Navbar */}
                <motion.div
                    className="flex justify-center w-full py-6 px-4 fixed top-0 left-0 right-0 z-40"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center justify-between px-6 py-3 rounded-full w-full max-w-7xl relative z-10">
                        <div className="flex items-center">
                        </div>
                    </div>
                </motion.div>

                {/* Welcome Section */}
                <motion.div
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24 relative z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="text-left mb-12">
                        <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 leading-tight">
                            Blockchain Transactions
                        </h1>
                        <p className="text-base/7 md:text-xl/8 font-light tracking-tight text-white/80 max-w-3xl">
                            Real-time indexed transactions from MizuPay contract with live monitoring and analytics.
                        </p>
                    </div>
                </motion.div>

                {/* Main Content */}
                <motion.div
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12"
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    {/* Stats Cards Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>

                    {/* Filters Skeleton */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="h-10 bg-white/20 rounded-lg animate-pulse"></div>
                        </div>
                        <div className="h-10 bg-white/20 rounded-lg w-48 animate-pulse"></div>
                        <div className="h-10 bg-white/20 rounded-lg w-32 animate-pulse"></div>
                        <div className="h-10 bg-white/20 rounded-lg w-10 animate-pulse"></div>
                        <div className="h-10 bg-white/20 rounded-lg w-20 animate-pulse"></div>
                    </div>

                    {/* Transactions List Skeleton */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="h-8 bg-white/20 rounded w-48 animate-pulse mb-4"></div>
                            {[...Array(3)].map((_, index) => (
                                <SkeletonTransactionCard key={index} />
                            ))}
 </div>
 </div>
                </motion.div>
 </div>
 )
 }

 return (
 <div className="min-h-screen bg-black text-white relative overflow-hidden">
 {/* Animated Background */}
 <div className="absolute inset-0">
  <ShaderBackground className="h-full w-full" />
 </div>
 <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-gray-900/60 to-black/80">
  <div className="absolute inset-0 [background:radial-gradient(120%_80%_at_50%_50%,_transparent_40%,_black_100%)]" />
 </div>

 {/* Header - Glass Morphism Navbar */}
 <motion.div 
 className="flex justify-center w-full py-6 px-4 fixed top-0 left-0 right-0 z-40"
 initial={{ opacity: 0, y: -20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 >
 <div className="flex items-center justify-between px-6 py-3 rounded-full w-full max-w-7xl relative z-10">
 <div className="flex items-center">
 </div>
 </div>
 </motion.div>

 {/* Welcome Section */}
 <motion.div 
 className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24 relative z-10"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 >
 <div className="text-left mb-12">
 <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 leading-tight">
 Blockchain Transactions
 </h1>
                    <p className="text-base/7 md:text-xl/8 font-light tracking-tight text-white/80 max-w-3xl">
 Real-time indexed transactions from MizuPay contract with live monitoring and analytics.
 </p>
 </div>
 </motion.div>

 {/* Main Content */}
 <motion.div 
 className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12"
 variants={containerVariants}
 initial="hidden"
 animate="visible"
 >
 {/* Real-time Status Banner */}
 {lastUpdate && (
 <motion.div 
 variants={itemVariants}
 className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
 >
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
 <span className="text-green-400 text-sm font-medium">Real-time monitoring active</span>
 <span className="text-green-300/70 text-xs ml-auto">
 Last updated: {lastUpdate.toLocaleTimeString()}
 </span>
 </div>
                        <div className="mt-2 text-xs text-green-400/80">
                            Powered by Envio Indexer • Live blockchain data
                        </div>
 </motion.div>
 )}

 {/* Stats Cards */}
 {stats && (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
 <motion.div 
 variants={itemVariants}
 whileHover={{ scale: 1.05, y: -5 }}
 transition={hoverTransition}
 >
                            <Card className="p-6 rounded-2xl bg-black/20 backdrop-blur-2xl border border-white/10 shadow-2xl hover:bg-black/30 hover:border-white/20 transition-all duration-500">
 <CardContent className="p-0">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold text-white tracking-tight">Total Payments</h3>
                                        <DollarSign className="w-5 h-5 text-blue-400" />
 </div>
 <div className="mb-2">
 <span className="text-4xl font-bold text-white tracking-tight">{stats.totalPayments}</span>
 </div>
                                    <p className="text-blue-400 text-sm tracking-tight">All time payments • Envio indexed</p>
 </CardContent>
 </Card>
 </motion.div>

 <motion.div 
 variants={itemVariants}
 whileHover={{ scale: 1.05, y: -5 }}
 transition={hoverTransition}
 >
                            <Card className="p-6 rounded-2xl bg-black/20 backdrop-blur-2xl border border-white/10 shadow-2xl hover:bg-black/30 hover:border-white/20 transition-all duration-500">
 <CardContent className="p-0">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold text-white tracking-tight">Total Volume</h3>
                                        <DollarSign className="w-5 h-5 text-blue-400" />
 </div>
 <div className="mb-2">
 <span className="text-4xl font-bold text-white tracking-tight">
 {formatBigIntAmount(stats.totalVolume, 2)} cUSD
 </span>
 </div>
                                    <p className="text-blue-400 text-sm tracking-tight">Total transaction volume • Envio indexed</p>
 </CardContent>
 </Card>
 </motion.div>

 <motion.div 
 variants={itemVariants}
 whileHover={{ scale: 1.05, y: -5 }}
 transition={hoverTransition}
 >
                            <Card className="p-6 rounded-2xl bg-black/20 backdrop-blur-2xl border border-white/10 shadow-2xl hover:bg-black/30 hover:border-white/20 transition-all duration-500">
 <CardContent className="p-0">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold text-white tracking-tight">Unique Users</h3>
                                        <User className="w-5 h-5 text-blue-400" />
 </div>
 <div className="mb-2">
 <span className="text-4xl font-bold text-white tracking-tight">{stats.uniqueUsers}</span>
 </div>
                                    <p className="text-blue-400 text-sm tracking-tight">Unique wallet addresses • Envio indexed</p>
 </CardContent>
 </Card>
 </motion.div>
 </div>
 )}

 {/* Filters and Search */}
 <motion.div 
 variants={itemVariants}
 className="flex flex-col md:flex-row gap-4 mb-6"
 >
 <div className="flex-1">
 <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400/60 h-4 w-4" />
 <Input
 placeholder="Search by address, session ID, or transaction hash..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-white/10 border-blue-500/20 text-white placeholder-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/40 transition-all duration-300"
 />
 </div>
 </div>
 
 <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                        <SelectTrigger className="w-48 bg-white/10 border-blue-500/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/40 transition-all duration-300">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Transactions</SelectItem>
 <SelectItem value="payments">Payments Only</SelectItem>
 <SelectItem value="withdrawals">Withdrawals Only</SelectItem>
 </SelectContent>
 </Select>

 <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
 <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300">
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
                        className="group relative overflow-hidden border border-blue-500/30 bg-gradient-to-r from-blue-500/20 to-blue-600/10 px-4 py-2 text-sm rounded-lg font-medium tracking-wide text-white backdrop-blur-sm transition-[border-color,background-color,box-shadow] duration-500 hover:border-blue-400/50 hover:bg-blue-500/30 hover:shadow-lg hover:shadow-blue-500/30"
 >
 {sortOrder === 'asc' ? '↑' : '↓'}
 </Button>

 <Button
 onClick={fetchTransactions}
                        className="group relative overflow-hidden border border-blue-500/30 bg-gradient-to-r from-blue-500/20 to-blue-600/10 px-4 py-2 text-sm rounded-lg font-medium tracking-wide text-white backdrop-blur-sm transition-[border-color,background-color,box-shadow] duration-500 hover:border-blue-400/50 hover:bg-blue-500/30 hover:shadow-lg hover:shadow-blue-500/30"
 >
 <RefreshCw className="h-4 w-4 mr-2" />
 Refresh
 </Button>
 </motion.div>

 {/* Transactions List */}
 <div className="space-y-6">
 {/* Payments */}
 {(filterType === 'all' || filterType === 'payments') && (
 <motion.div variants={itemVariants}>
 <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                                <DollarSign className="h-6 w-6 mr-2 text-blue-400" />
 Payments ({sortedPayments.length})
                                <span className="ml-2 text-sm text-blue-400/80 font-normal">• Envio indexed</span>
 </h2>
 
 {sortedPayments.length === 0 ? (
                                <Card className="p-6 rounded-2xl bg-black/20 backdrop-blur-2xl border border-white/10 shadow-2xl">
 <CardContent className="p-0">
 <div className="text-center">
                                            <p className="text-blue-400">No payments found</p>
 </div>
 </CardContent>
 </Card>
 ) : (
 <div className="space-y-4">
 {sortedPayments.map((payment, index) => (
 <motion.div
 key={payment.id}
 variants={itemVariants}
 whileHover={{ scale: 1.02, y: -2 }}
 transition={hoverTransition}
 >
                                            <Card className="p-6 rounded-2xl bg-black/20 backdrop-blur-2xl border border-white/10 shadow-2xl hover:bg-black/30 hover:border-white/20 transition-all duration-500">
 <CardContent className="p-0">
 <div className="flex items-center justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-4 mb-2">
 <Badge variant="secondary" className="bg-green-900/30 text-green-400 border-green-500/30">
 Payment
 </Badge>
 <div className="flex items-center gap-2">
                                                                    <span className="text-sm text-blue-400">From:</span>
 <span className="text-sm text-white font-mono">{formatAddress(payment.payer)}</span>
 </div>
 <div className="flex items-center gap-2">
                                                                    <span className="text-sm text-blue-400">Store:</span>
                                                                    <span className="text-sm text-white font-medium">MizuPay Store</span>
 </div>
 <div className="flex items-center gap-2">
                                                                    <span className="text-sm text-blue-400">Session:</span>
 <span className="text-xs text-white font-mono bg-white/5 px-2 py-1 rounded">{payment.sessionId}</span>
 </div>
 </div>
 
 <div className="flex items-center gap-6 text-sm">
 <div>
                                                                    <span className="text-blue-400">Amount: </span>
 <span className="text-white font-semibold">
 {formatAmount(payment.amount, payment.currency)}
 </span>
 </div>
 <div>
                                                                    <span className="text-blue-400">Block: </span>
 <span className="text-white">{payment.blockNumber}</span>
 </div>
                                                                <div className="flex items-center text-blue-400">
 <Clock className="h-4 w-4 mr-1" />
 {formatTimestamp(payment.timestamp)}
 </div>
 </div>
 <div className="mt-2 text-xs text-white/50 font-mono">
 Tx: {payment.transactionHash.slice(0, 20)}...
 </div>
 </div>
 
 <Button
 variant="outline"
 size="sm"
 onClick={() => window.open(getExplorerUrl(payment.transactionHash), '_blank')}
                                                            className="group relative overflow-hidden border border-blue-500/30 bg-gradient-to-r from-blue-500/20 to-blue-600/10 px-4 py-2 text-sm rounded-lg font-medium tracking-wide text-white backdrop-blur-sm transition-[border-color,background-color,box-shadow] duration-500 hover:border-blue-400/50 hover:bg-blue-500/30 hover:shadow-lg hover:shadow-blue-500/30"
 >
 <ExternalLink className="h-4 w-4 mr-2" />
 View on Explorer
 </Button>
 </div>
 </CardContent>
 </Card>
 </motion.div>
 ))}
 </div>
 )}
 </motion.div>
 )}

 {/* Withdrawals */}
 {(filterType === 'all' || filterType === 'withdrawals') && (
 <motion.div variants={itemVariants}>
 <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                                <DollarSign className="h-6 w-6 mr-2 text-blue-400" />
 Withdrawals ({sortedWithdrawals.length})
                                <span className="ml-2 text-sm text-blue-400/80 font-normal">• Envio indexed</span>
 </h2>
 
 {sortedWithdrawals.length === 0 ? (
                                <Card className="p-6 rounded-2xl bg-black/20 backdrop-blur-2xl border border-white/10 shadow-2xl">
 <CardContent className="p-0">
 <div className="text-center">
                                            <p className="text-blue-400">No withdrawals found</p>
 </div>
 </CardContent>
 </Card>
 ) : (
 <div className="space-y-4">
 {sortedWithdrawals.map((withdrawal, index) => (
 <motion.div
 key={withdrawal.id}
 variants={itemVariants}
 whileHover={{ scale: 1.02, y: -2 }}
 transition={hoverTransition}
 >
                                            <Card className="p-6 rounded-2xl bg-black/20 backdrop-blur-2xl border border-white/10 shadow-2xl hover:bg-black/30 hover:border-white/20 transition-all duration-500">
 <CardContent className="p-0">
 <div className="flex items-center justify-between">
 <div className="flex-1">
 <div className="flex items-center gap-4 mb-2">
 <Badge variant="secondary" className="bg-red-900/30 text-red-400 border-red-500/30">
 Withdrawal
 </Badge>
                                                                <span className="text-sm text-blue-400">
 To: {formatAddress(withdrawal.to)}
 </span>
 </div>
 
 <div className="flex items-center gap-6 text-sm">
 <div>
                                                                    <span className="text-blue-400">Amount: </span>
 <span className="text-white font-semibold">
 {formatAmount(withdrawal.amount, withdrawal.currency)}
 </span>
 </div>
 <div>
                                                                    <span className="text-blue-400">Block: </span>
 <span className="text-white">{withdrawal.blockNumber}</span>
 </div>
                                                                <div className="flex items-center text-blue-400">
 <Clock className="h-4 w-4 mr-1" />
 {formatTimestamp(withdrawal.timestamp)}
 </div>
 </div>
 </div>
 
 <Button
 variant="outline"
 size="sm"
 onClick={() => window.open(getExplorerUrl(withdrawal.transactionHash), '_blank')}
                                                            className="group relative overflow-hidden border border-blue-500/30 bg-gradient-to-r from-blue-500/20 to-blue-600/10 px-4 py-2 text-sm rounded-lg font-medium tracking-wide text-white backdrop-blur-sm transition-[border-color,background-color,box-shadow] duration-500 hover:border-blue-400/50 hover:bg-blue-500/30 hover:shadow-lg hover:shadow-blue-500/30"
 >
 <ExternalLink className="h-4 w-4 mr-2" />
 View on Explorer
 </Button>
 </div>
 </CardContent>
 </Card>
 </motion.div>
 ))}
 </div>
 )}
 </motion.div>
 )}
 </div>
 </motion.div>
 </div>
 )
}