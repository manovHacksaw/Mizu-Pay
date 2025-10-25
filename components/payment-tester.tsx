'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { CONTRACT_ADDRESSES, MOCK_CUSD_ABI, MIZU_PAY_ABI } from '@/lib/contracts'

export default function PaymentTester() {
  const { address, isConnected } = useAccount()
  const [amount, setAmount] = useState('1')
  const [sessionId, setSessionId] = useState('')
  const [paymentType, setPaymentType] = useState<'cUSD' | 'CELO'>('cUSD')
  const [isLoading, setIsLoading] = useState(false)

  // Generate session ID on mount
  useEffect(() => {
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  }, [])

  // Read contract data
  const { data: cUSDBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.MOCK_CUSD,
    abi: MOCK_CUSD_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  const { data: contractBalances } = useReadContract({
    address: CONTRACT_ADDRESSES.MIZU_PAY,
    abi: MIZU_PAY_ABI,
    functionName: 'getBalances',
  })

  const { data: totalPayments } = useReadContract({
    address: CONTRACT_ADDRESSES.MIZU_PAY,
    abi: MIZU_PAY_ABI,
    functionName: 'totalPayments',
  })

  const { data: totalVolume } = useReadContract({
    address: CONTRACT_ADDRESSES.MIZU_PAY,
    abi: MIZU_PAY_ABI,
    functionName: 'totalVolume',
  })

  // Write contract functions
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: hash,
  })

  const handlePayment = async () => {
    if (!address || !amount) return

    setIsLoading(true)
    try {
      const amountWei = parseUnits(amount, 18) // Assuming 18 decimals

      if (paymentType === 'cUSD') {
        // First approve cUSD spending
        writeContract({
          address: CONTRACT_ADDRESSES.MOCK_CUSD,
          abi: MOCK_CUSD_ABI,
          functionName: 'approve',
          args: [CONTRACT_ADDRESSES.MIZU_PAY, amountWei],
        })

        // Wait for approval, then pay
        setTimeout(() => {
          writeContract({
            address: CONTRACT_ADDRESSES.MIZU_PAY,
            abi: MIZU_PAY_ABI,
            functionName: 'payWithCUSD',
            args: [amountWei, sessionId],
          })
        }, 2000)
      } else {
        // Pay with CELO
        writeContract({
          address: CONTRACT_ADDRESSES.MIZU_PAY,
          abi: MIZU_PAY_ABI,
          functionName: 'payWithCELO',
          args: [sessionId],
          value: amountWei,
        })
      }
    } catch (error) {
      console.error('Payment error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Payment Tester</h2>
        <p className="text-gray-400">Please connect your wallet to test payments</p>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Payment Tester</h2>
      
      {/* Your Balance */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-2">Your Balance</h3>
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-white">
            cUSD: {cUSDBalance ? formatUnits(cUSDBalance, 18) : '0'} tokens
          </p>
        </div>
      </div>

      {/* Contract Stats */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-2">Contract Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total Payments</p>
            <p className="text-white font-bold">{totalPayments?.toString() || '0'}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total Volume</p>
            <p className="text-white font-bold">
              {totalVolume ? formatUnits(totalVolume, 18) : '0'} CELO
            </p>
          </div>
        </div>
        {contractBalances && (
          <div className="mt-4 bg-white/5 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Contract Balances</p>
            <p className="text-white">
              CELO: {formatUnits(contractBalances[0], 18)} | 
              cUSD: {formatUnits(contractBalances[1], 18)}
            </p>
          </div>
        )}
      </div>

      {/* Payment Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Payment Type</label>
          <select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value as 'cUSD' | 'CELO')}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
          >
            <option value="cUSD">Pay with cUSD</option>
            <option value="CELO">Pay with CELO</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1.0"
            step="0.1"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Session ID</label>
          <input
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
          />
        </div>

        <button
          onClick={handlePayment}
          disabled={isLoading || isConfirming}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
        >
          {isLoading ? 'Processing...' : isConfirming ? 'Confirming...' : `Pay ${amount} ${paymentType}`}
        </button>

        {hash && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <p className="text-green-400 text-sm mb-2">Transaction Hash:</p>
            <p className="text-green-300 font-mono text-xs break-all">{hash}</p>
            {isConfirmed && (
              <p className="text-green-400 text-sm mt-2">✅ Transaction confirmed!</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
