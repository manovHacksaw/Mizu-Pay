'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { WalletConnectButton } from '@/components/ui/wallet-connect-button'

export default function PaymentTesterSimple() {
  const { address, isConnected } = useAccount()
  const [amount, setAmount] = useState('1')
  const [paymentType, setPaymentType] = useState<'cUSD' | 'CELO'>('cUSD')

  if (!isConnected) {
    return (
      <div className="text-center">
        <p className="text-gray-400 mb-4">Connect your wallet to test payments</p>
        <WalletConnectButton />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Amount
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="1"
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Token
        </label>
        <select
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value as 'cUSD' | 'CELO')}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="cUSD">cUSD</option>
          <option value="CELO">CELO</option>
        </select>
      </div>

      <div className="bg-white/5 rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">Payment Summary</h4>
        <p className="text-gray-300 text-sm">Amount: {amount} {paymentType}</p>
        <p className="text-gray-300 text-sm">Wallet: {address}</p>
      </div>

      <button
        disabled
        className="w-full bg-gray-600 text-gray-400 font-medium py-2 px-4 rounded-lg cursor-not-allowed"
      >
        Payment functionality moved to main payment page
      </button>
    </div>
  )
}
