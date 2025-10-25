'use client'

import { useUser } from '@clerk/nextjs'
import { useAccount, useSignMessage } from 'wagmi'
import { WalletConnectButton } from '@/components/ui/wallet-connect-button'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { Filter, Users, Clock, Zap, ArrowRight, Wallet, CreditCard, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// Skeleton Loader Component
const SkeletonCard = () => (
 <Card className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
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

const SkeletonMainCard = () => (
 <Card className="h-full p-6 overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
  <CardContent className="p-0">
   <div className="flex items-center justify-between mb-6">
    <div className="h-6 bg-white/20 rounded w-40 animate-pulse"></div>
    <div className="h-5 w-5 bg-white/20 rounded animate-pulse"></div>
   </div>
   <div className="space-y-4">
    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
     <div className="h-4 bg-white/20 rounded w-24 mb-2 animate-pulse"></div>
     <div className="h-4 bg-white/20 rounded w-32 animate-pulse"></div>
    </div>
    <div className="h-10 bg-white/20 rounded w-full animate-pulse"></div>
   </div>
  </CardContent>
 </Card>
)

// Sub-component for animating numbers
const AnimatedNumber = ({ value }: { value: number }) => {
 const count = useMotionValue(0);
 const rounded = useTransform(count, (latest) => Math.round(latest * 10) / 10);

 useEffect(() => {
 const controls = animate(count, value, {
 duration: 1.5,
 ease: "easeOut",
 });
 return controls.stop;
 }, [value, count]);

 return <motion.span>{rounded}</motion.span>;
};

function DashboardContent() {
 const { user, isLoaded } = useUser()
 const { address, isConnected } = useAccount()
 const { signMessageAsync } = useSignMessage()
 const [isSigning, setIsSigning] = useState(false)
 const [signature, setSignature] = useState('')
 const [error, setError] = useState('')
 const [mounted, setMounted] = useState(false)
 const [savedWallets, setSavedWallets] = useState<any[]>([])
 const [loadingWallets, setLoadingWallets] = useState(false)
 const [isLoading, setIsLoading] = useState(true)
 const [isWalletVerified, setIsWalletVerified] = useState(false)

 useEffect(() => {
 setMounted(true)
 // Simulate loading time
 const timer = setTimeout(() => {
  setIsLoading(false)
 }, 1500)
 return () => clearTimeout(timer)
 }, [])

 useEffect(() => {
 if (user && mounted) {
 fetchSavedWallets()
 }
 }, [user, mounted])

 // Check if current wallet is already verified
 useEffect(() => {
 if (address && savedWallets.length > 0) {
  const isVerified = savedWallets.some(wallet => 
   wallet.address.toLowerCase() === address.toLowerCase()
  )
  setIsWalletVerified(isVerified)
 } else {
  setIsWalletVerified(false)
 }
 }, [address, savedWallets])

 const fetchSavedWallets = async () => {
 try {
 setLoadingWallets(true)
 const response = await fetch('/api/wallets')
 if (response.ok) {
 const data = await response.json()
 setSavedWallets(data.wallets || [])
 console.log('Saved wallets:', data.wallets)
 } else {
 console.error('Failed to fetch wallets')
 }
 } catch (error) {
 console.error('Error fetching wallets:', error)
 } finally {
 setLoadingWallets(false)
 }
 }

 const handleSignMessage = async () => {
 if (!address || !signMessageAsync) return

 setIsSigning(true)
 setError('')

 try {
 const message = `Welcome to Mizu Pay! Please sign this message to verify wallet ownership.\n\nWallet: ${address}\nTimestamp: ${Date.now()}`
 
 const sig = await signMessageAsync({ message })
 setSignature(sig)
 
 // Save wallet to database after successful signing
 await saveWalletToDatabase(address, sig)
 } catch (err: any) {
 console.error('Signing error:', err)
 
 // Handle specific error cases
 if (err?.message?.includes('getChainId')) {
 setError('Wallet connection issue. Please try reconnecting your wallet.')
 } else if (err?.message?.includes('User rejected')) {
 setError('Message signing was cancelled.')
 } else {
 setError('Failed to sign message. Please try again.')
 }
 } finally {
 setIsSigning(false)
 }
 }

 const saveWalletToDatabase = async (walletAddress: string, signature: string) => {
 try {
 console.log('Saving wallet to database:', { address: walletAddress, signature })
 
 const response = await fetch('/api/wallets', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 address: walletAddress,
 signature: signature,
 }),
 })

 const data = await response.json()
 console.log('Wallet save response:', data)

 if (!response.ok) {
 console.error('Failed to save wallet:', data)
 setError('Failed to save wallet to database')
 } else {
 console.log('Wallet saved successfully:', data)
 // Refresh the wallets list
 fetchSavedWallets()
 }
 } catch (error) {
 console.error('Error saving wallet:', error)
 setError('Failed to save wallet to database')
 }
 }

 if (!isLoaded || !mounted) {
 return (
 <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
 <div className="text-white text-xl">Loading...</div>
 </div>
 )
 }

 if (!user) {
 return (
 <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
 <div className="text-center">
 <h1 className="text-3xl font-bold text-white mb-4">Please sign in</h1>
 <p className="text-gray-400">You need to be signed in to access the dashboard.</p>
 </div>
 </div>
 )
 }

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

 const hoverTransition = { type: "spring", stiffness: 300, damping: 15 };

 return (
 <div className="min-h-screen bg-black text-white relative overflow-hidden">
 {/* Animated Background */}
 <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
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

 {/* Right Section - Connect Button */}
 <motion.div
 className="flex items-center gap-8 absolute right-6"
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.3, delay: 0.2 }}
 >
          <WalletConnectButton />
 </motion.div>
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
 <h1 className="text-[clamp(2.25rem,6vw,4rem)] font-extralight leading-[0.95] tracking-tight text-white mb-4">
 Welcome back, {user.firstName || user.emailAddresses[0]?.emailAddress}!
 </h1>
 <p className="text-lg tracking-tight text-white/70 md:text-xl max-w-2xl">
 Manage your payments and wallet connections with fluid, regenerative finance.
 </p>
 </div>
 </motion.div>

 {/* Stats Grid - Moved to Top */}
 <motion.div 
 className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12"
 variants={containerVariants}
 initial="hidden"
 animate="visible"
 >
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
 {isLoading ? (
  <>
   <SkeletonCard />
   <SkeletonCard />
   <SkeletonCard />
  </>
 ) : (
  <>
 <motion.div 
 variants={itemVariants}
 whileHover={{ scale: 1.05, y: -5 }}
 transition={hoverTransition}
 >
 <Card className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-500">
 <CardContent className="p-0">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold text-white tracking-tight">Total Payments</h3>
 <Clock className="w-5 h-5 text-white/70" />
 </div>
 <div className="mb-2">
 <span className="text-4xl font-bold text-white tracking-tight">
 <AnimatedNumber value={0} />
 </span>
 <span className="ml-1 text-white/70">payments</span>
 </div>
 <p className="text-white/70 text-sm tracking-tight">All time</p>
 </CardContent>
 </Card>
 </motion.div>

 <motion.div 
 variants={itemVariants}
 whileHover={{ scale: 1.05, y: -5 }}
 transition={hoverTransition}
 >
 <Card className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-500">
 <CardContent className="p-0">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold text-white tracking-tight">Connected Wallets</h3>
 <Wallet className="w-5 h-5 text-white/70" />
 </div>
 <div className="mb-2">
 <span className="text-4xl font-bold text-white tracking-tight">
 <AnimatedNumber value={isConnected ? 1 : 0} />
 </span>
 <span className="ml-1 text-white/70">wallets</span>
 </div>
 <p className="text-white/70 text-sm tracking-tight">Active wallets</p>
 </CardContent>
 </Card>
 </motion.div>

 <motion.div 
 variants={itemVariants}
 whileHover={{ scale: 1.05, y: -5 }}
 transition={hoverTransition}
 >
 <Card className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-500">
 <CardContent className="p-0">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold text-white tracking-tight">ReFi Impact</h3>
 <TrendingUp className="w-5 h-5 text-white/70" />
 </div>
 <div className="mb-2">
 <span className="text-4xl font-bold text-white tracking-tight">
 $<AnimatedNumber value={0} />
 </span>
 <span className="ml-1 text-white/70">contributed</span>
 </div>
 <p className="text-white/70 text-sm tracking-tight">Contributed</p>
 </CardContent>
 </Card>
 </motion.div>
  </>
 )}
 </div>

 {/* Main Content Cards */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 {isLoading ? (
  <>
   <SkeletonMainCard />
   <SkeletonMainCard />
   <SkeletonMainCard />
   <SkeletonMainCard />
  </>
 ) : (
  <>
 {/* Wallet Connection Card */}
 <motion.div 
 variants={itemVariants}
 whileHover={{ scale: 1.03, y: -5 }}
 transition={hoverTransition}
 >
 <Card className="h-full p-6 overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-500">
 <CardContent className="p-0">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-xl font-semibold text-white">Wallet Connection</h2>
 <Wallet className="w-5 h-5 text-white/70" />
 </div>
 <div className="space-y-4">
 {isConnected ? (
 <div className="space-y-4">
 <div className="bg-white/5 rounded-lg p-4 border border-white/10">
 <p className="text-sm text-white/70 mb-1">Connected Wallet</p>
 <p className="font-mono text-sm text-white">{address}</p>
 </div>

 {/* Verification Status */}
 {isWalletVerified ? (
 <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
 <div className="flex items-center gap-2 mb-2">
  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
  <p className="text-green-400 text-sm font-medium">Wallet Verified</p>
 </div>
 <p className="text-green-300/70 text-xs">This wallet is already associated with your account</p>
 </div>
 ) : (
 <>
 <Button
  onClick={handleSignMessage}
  disabled={isSigning}
  className="w-full group relative overflow-hidden border border-white/30 bg-gradient-to-r from-white/20 to-white/10 px-4 py-2 text-sm rounded-lg font-medium tracking-wide text-white backdrop-blur-sm transition-[border-color,background-color,box-shadow] duration-500 hover:border-white/50 hover:bg-white/20 hover:shadow-lg hover:shadow-white/10 disabled:opacity-50"
 >
  {isSigning ? 'Signing...' : 'Sign Message to Verify Ownership'}
 </Button>

 {signature && (
 <div className="bg-white/5 border border-white/10 rounded-lg p-4">
 <p className="text-white text-sm mb-2">Message signed successfully!</p>
 <p className="text-white/70 font-mono text-xs break-all">{signature}</p>
 </div>
 )}

 {error && (
 <div className="bg-white/5 border border-white/10 rounded-lg p-4">
 <p className="text-white text-sm">{error}</p>
 </div>
 )}
 </>
 )}
 </div>
 ) : (
 <div className="text-center">
 <p className="text-white/70 mb-4">Connect your wallet to get started</p>
          <WalletConnectButton />
 </div>
 )}
 </div>
 </CardContent>
 </Card>
 </motion.div>

 {/* Account Information Card */}
 <motion.div 
 variants={itemVariants}
 whileHover={{ scale: 1.03, y: -5 }}
 transition={hoverTransition}
 >
 <Card className="h-full p-6 overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-500">
 <CardContent className="p-0">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-xl font-semibold text-white">Account Information</h2>
 <Users className="w-5 h-5 text-white/70" />
 </div>
 <div className="space-y-4">
 <div className="bg-white/5 rounded-lg p-4 border border-white/10">
 <p className="text-sm text-white/70 mb-1">Name</p>
 <p className="font-medium text-white">{user.fullName || 'Not provided'}</p>
 </div>
 <div className="bg-white/5 rounded-lg p-4 border border-white/10">
 <p className="text-sm text-white/70 mb-1">Email</p>
 <p className="font-medium text-white">{user.emailAddresses[0]?.emailAddress}</p>
 </div>
 <div className="bg-white/5 rounded-lg p-4 border border-white/10">
 <p className="text-sm text-white/70 mb-1">User ID</p>
 <p className="font-mono text-sm text-white">{user.id}</p>
 </div>
 </div>
 </CardContent>
 </Card>
 </motion.div>

 {/* Your Saved Wallets Card */}
 <motion.div 
 variants={itemVariants}
 whileHover={{ scale: 1.03, y: -5 }}
 transition={hoverTransition}
 >
 <Card className="h-full p-6 overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-500">
 <CardContent className="p-0">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-xl font-semibold text-white">Your Saved Wallets</h2>
 <CreditCard className="w-5 h-5 text-white/70" />
 </div>
 {loadingWallets ? (
 <div className="text-center text-white/70">Loading wallets...</div>
 ) : savedWallets.length > 0 ? (
 <div className="space-y-3">
 {savedWallets.map((wallet, index) => (
 <motion.div 
 key={wallet.id} 
 className="bg-white/5 rounded-lg p-4 border border-white/10"
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.3, delay: index * 0.1 }}
 >
 <div className="flex items-center justify-between">
 <div>
 <p className="font-mono text-sm text-white">{wallet.address}</p>
 <p className="text-white/70 text-xs">
 {wallet.isPrimary ? 'Primary Wallet' : 'Secondary Wallet'} • 
 Added {new Date(wallet.createdAt).toLocaleDateString()}
 </p>
 </div>
 {wallet.isPrimary && (
 <span className="bg-white/10 text-white px-2 py-1 rounded-full text-xs">
 Primary
 </span>
 )}
 </div>
 </motion.div>
 ))}
 </div>
 ) : (
 <div className="text-center text-white/70">
 <p>No wallets saved yet</p>
 <p className="text-sm mt-1">Connect and sign a message to save your wallet</p>
 </div>
 )}
 </CardContent>
 </Card>
 </motion.div>

 {/* Recent Transactions Card */}
 <motion.div 
 variants={itemVariants}
 whileHover={{ scale: 1.03, y: -5 }}
 transition={hoverTransition}
 >
 <Card className="h-full p-6 overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-500">
 <CardContent className="p-0">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
 <TrendingUp className="w-5 h-5 text-white/70" />
 </div>
 <div className="space-y-4">
 <p className="text-white/70">Your latest payment activity</p>
 <div className="space-y-3">
 <div className="bg-white/5 rounded-lg p-4 border border-white/10">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-white font-medium">No transactions yet</p>
 <p className="text-white/70 text-sm">Complete your first payment to see activity here</p>
 </div>
 <div className="text-white/50 text-sm">
 --
 </div>
 </div>
 </div>
 <div className="text-center py-4">
 <p className="text-white/50 text-sm">Start making payments to see your transaction history</p>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 </motion.div>
  </>
 )}
 </div>

 {/* CTA Banner */}
 <motion.div 
 variants={itemVariants} 
 whileHover={{ scale: 1.02 }}
 transition={hoverTransition}
 className="mt-8"
 >
 <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-500">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-full bg-white/5">
 <Zap className="w-5 h-5 text-white" />
 </div>
 <div>
 <p className="text-sm font-medium text-white">Make a Payment</p>
 <p className="text-xs text-white/70">Process payments using CUSD or CELO tokens</p>
 </div>
 </div>
 <Button asChild className="group relative overflow-hidden border border-white/30 bg-gradient-to-r from-white/20 to-white/10 px-4 py-2 text-sm rounded-lg font-medium tracking-wide text-white backdrop-blur-sm transition-[border-color,background-color,box-shadow] duration-500 hover:border-white/50 hover:bg-white/20 hover:shadow-lg hover:shadow-white/10">
 <Link href="/payment">
 Go to Payment Page
 <ArrowRight className="w-4 h-4 ml-2" />
 </Link>
 </Button>
 </div>
 </motion.div>
 </motion.div>
 </div>
 )
}

export default function Dashboard() {
 return <DashboardContent />
}

