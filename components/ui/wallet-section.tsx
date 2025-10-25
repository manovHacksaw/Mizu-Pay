"use client"

import { ArrowRight } from "lucide-react"

export function WalletSection() {
  return (
    <section className="min-h-screen bg-black py-20 px-8 flex items-center">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 gap-16 items-center">
          {/* Left Column */}
          <div className="flex flex-col justify-center">
            <p className="text-gray-400 text-sm font-medium mb-6">Mizu Wallet</p>
            <h2 className="text-7xl font-bold text-white mb-6 leading-tight">Secure cUSD & CELO Management</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              Store, send, and receive your CELO assets with ease. Our wallet features top-notch security, supports easy
              Web3 onboarding via Gmail, and provides a user-friendly interface for daily spending.
            </p>
            <button className="w-fit px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
              Launch DApp
              <ArrowRight size={18} />
            </button>

            {/* Video Placeholder */}
            <div className="mt-12">
              <div className="w-64 h-64 rounded-full border-2 border-gray-600 flex items-center justify-center bg-gray-900/50">
                <div className="text-center">
                  <div className="text-gray-500 text-sm">Video Placeholder</div>
                  <div className="text-gray-600 text-xs mt-2">wallet-demo.mp4</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Wallet Dashboard */}
          <div className="flex justify-end">
            <div className="w-full max-w-md bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
              {/* Balance Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-400 text-sm">Total Available Balance</p>
                  <span className="text-green-500 text-sm font-medium">+2.4%</span>
                </div>
                <h3 className="text-4xl font-bold text-white mb-6">$956.19</h3>

                {/* Chart */}
                <div className="h-16 flex items-end gap-1 mb-6">
                  <div className="flex-1 h-8 bg-gradient-to-t from-green-500 to-green-400 rounded-sm opacity-60"></div>
                  <div className="flex-1 h-12 bg-gradient-to-t from-green-500 to-green-400 rounded-sm"></div>
                  <div className="flex-1 h-10 bg-gradient-to-t from-green-500 to-green-400 rounded-sm opacity-70"></div>
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                </div>
              </div>

              {/* Assets List */}
              <div className="space-y-4">
                {/* cUSD */}
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-sm">
                      C
                    </div>
                    <div>
                      <p className="text-white font-medium">+100 cUSD</p>
                      <p className="text-gray-400 text-xs">$100.00</p>
                    </div>
                  </div>
                  <button className="text-green-500 text-sm font-medium hover:text-green-400">Receive</button>
                </div>

                {/* CELO */}
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      L
                    </div>
                    <div>
                      <p className="text-white font-medium">+50 CELO</p>
                      <p className="text-gray-400 text-xs">-11 ETH</p>
                    </div>
                  </div>
                  <button className="text-gray-400 text-sm font-medium hover:text-gray-300">Swap</button>
                </div>

                {/* Stablecoin */}
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                      S
                    </div>
                    <div>
                      <p className="text-white font-medium">-2.5 Stablecoin</p>
                      <p className="text-gray-400 text-xs">$355.03</p>
                    </div>
                  </div>
                  <button className="text-red-500 text-sm font-medium hover:text-red-400">Send</button>
                </div>

                {/* BNB */}
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                      B
                    </div>
                    <div>
                      <p className="text-white font-medium">+2.2 BNB</p>
                      <p className="text-gray-400 text-xs">$483.31</p>
                    </div>
                  </div>
                  <button className="text-green-500 text-sm font-medium hover:text-green-400">Receive</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
