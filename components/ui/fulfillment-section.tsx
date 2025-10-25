"use client"

import { ArrowRight } from "lucide-react"

export function FulfillmentSection() {
  return (
    <section className="min-h-screen bg-black py-20 px-8 flex items-center">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 gap-16 items-center">
          {/* Left Column */}
          <div className="flex flex-col justify-center">
            <p className="text-gray-400 text-sm font-medium mb-6">The Bridge</p>
            <h2 className="text-7xl font-bold text-white mb-6 leading-tight">Fast, Secure, Regenerative Payments</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              Seamlessly process your Web2 orders using crypto. Our secure engine instantly verifies the CELO
              transaction and fulfills the order via gift cards, all while directing 1% to ReFi pools.
            </p>
            <button className="w-fit px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
              How It Works
              <ArrowRight size={18} />
            </button>

            {/* Video Placeholder */}
            <div className="mt-12">
              <div className="w-64 h-64 rounded-full border-2 border-gray-600 flex items-center justify-center bg-gray-900/50">
                <div className="text-center">
                  <div className="text-gray-500 text-sm">Video Placeholder</div>
                  <div className="text-gray-600 text-xs mt-2">fulfillment-demo.mp4</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Flow */}
          <div className="flex flex-col gap-6">
            {/* Order Summary Card */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
              <h4 className="text-white font-bold mb-4">Order #12853</h4>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">1x Put Coin 2000K</span>
                  <span className="text-white font-medium">$87.30</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">1x Put Coin 1000K</span>
                  <span className="text-white font-medium">$43.65</span>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">$130.95</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Addons</span>
                  <span className="text-white">+$10.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tax</span>
                  <span className="text-white">$6.54</span>
                </div>
              </div>

              <div className="border-t border-gray-700 mt-4 pt-4 flex justify-between">
                <span className="text-white font-bold">Total</span>
                <span className="text-white font-bold text-lg">$147.49</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="grid grid-cols-3 gap-4">
              {/* Cryptocurrencies */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-green-500/50 cursor-pointer hover:border-green-500 transition-colors">
                <p className="text-gray-400 text-xs font-medium mb-3">Cryptocurrencies</p>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                    C
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-xs font-bold">
                    E
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    U
                  </div>
                </div>
              </div>

              {/* Card or Apple Pay */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors">
                <p className="text-gray-400 text-xs font-medium mb-3">Card or Apple Pay</p>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-xs font-bold">
                    V
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                    M
                  </div>
                </div>
              </div>

              {/* Others */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors">
                <p className="text-gray-400 text-xs font-medium mb-3">Others</p>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    P
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    G
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
