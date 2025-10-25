"use client"

import { ArrowRight } from "lucide-react"

export function RefiImpactSection() {
  return (
    <section className="min-h-screen bg-black py-20 px-8 flex items-center">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 gap-16 items-center">
          {/* Left Column */}
          <div className="flex flex-col justify-center">
            <p className="text-gray-400 text-sm font-medium mb-6">Impact & Loyalty</p>
            <h2 className="text-7xl font-bold text-white mb-6 leading-tight">Earn While Doing Good</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              Every transaction automatically contributes to climate-positive ReFi initiatives. Build a regenerative
              loyalty system where your purchases create real-world impact while earning rewards.
            </p>
            <button className="w-fit px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
              Learn About ReFi
              <ArrowRight size={18} />
            </button>

            {/* Video Placeholder */}
            <div className="mt-12">
              <div className="w-64 h-64 rounded-full border-2 border-gray-600 flex items-center justify-center bg-gray-900/50">
                <div className="text-center">
                  <div className="text-gray-500 text-sm">Video Placeholder</div>
                  <div className="text-gray-600 text-xs mt-2">refi-impact-demo.mp4</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Impact Cards */}
          <div className="flex flex-col gap-6">
            {/* Active Impact Card */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-green-500/20 text-green-500 text-xs font-bold rounded-full">ACTIVE</span>
              </div>

              <div className="mb-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold mb-4">
                  🌱
                </div>
                <h4 className="text-white font-bold text-lg mb-1">Carbon Offset Pool</h4>
                <p className="text-gray-400 text-sm">16:08 24 Jul, 2024</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  M
                </div>
                <span className="text-gray-300 text-sm">Mizu Pay</span>
              </div>

              {/* Impact Stats */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-green-500 text-sm font-medium">+$2,450 contributed this month</p>
              </div>
            </div>

            {/* Cancelled Impact Card */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-red-500/20 text-red-500 text-xs font-bold rounded-full">PAUSED</span>
              </div>

              <div className="mb-6 flex justify-center">
                <div className="text-6xl">🌍</div>
              </div>

              <div className="text-center">
                <h4 className="text-white font-bold text-lg mb-1">Ocean Cleanup Initiative</h4>
                <p className="text-gray-400 text-sm">22:08 30 May, 2024</p>
              </div>

              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  M
                </div>
                <span className="text-gray-300 text-sm">Mizu Pay</span>
              </div>

              {/* Impact Stats */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-sm">Paused - Resume anytime</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
