"use client"

import { useState } from "react"

interface HowItWorksStep {
  number: string
  headline1: string
  headline2: string
  description: string
  videoPlaceholder: string
  isVideoLeft?: boolean
}

const steps: HowItWorksStep[] = [
  {
    number: "01",
    headline1: "Shop Anywhere.",
    headline2: "Pick what you love on any store.",
    description:
      "Start your shopping journey on your favorite e-commerce site — Amazon, Walmart, or any store. Add your products to the cart just like you always do. Mizupay works seamlessly with any online checkout.",
    videoPlaceholder: "/videos/step-1-demo.mp4",
    isVideoLeft: false,
  },
  {
    number: "02",
    headline1: "Pay with Crypto.",
    headline2: "Choose cUSD / Mizupay at checkout.",
    description:
      "When you're ready to buy, select the Pay with cUSD / Mizupay option. Mizupay securely connects your Celo wallet, detects the store and amount, and prepares a real-time checkout session — no cards, no bank delays, no middlemen.",
    videoPlaceholder: "/videos/step-2-demo.mp4",
    isVideoLeft: true,
  },
  {
    number: "03",
    headline1: "Impact & Fulfillment.",
    headline2: "Turning Payment into Climate Action.",
    description:
      "The payment is verified instantly on the CELO blockchain. Mizu Pay fulfills the order via our gift card engine and automatically channels 1% of the transaction into global ReFi pools, completing the regenerative loop.",
    videoPlaceholder: "/videos/step-3-demo.mp4",
    isVideoLeft: false,
  },
]

export function HowItWorksSection() {
  const [currentStep, setCurrentStep] = useState(0)
  const step = steps[currentStep]

  return (
    <section className="min-h-screen bg-black py-20 px-8 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto">
        {/* Step Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Text Content */}
          <div className={`${step.isVideoLeft ? "lg:order-2" : "lg:order-1"}`}>
            <h1 className="text-8xl md:text-9xl font-bold text-white mb-4 leading-tight">{step.headline1}</h1>
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-300 mb-12">{step.headline2}</h2>
            <p className="text-lg text-gray-400 leading-relaxed max-w-md">{step.description}</p>
          </div>

          {/* Video Placeholder */}
          <div className={`${step.isVideoLeft ? "lg:order-1" : "lg:order-2"}`}>
            <div className="aspect-video bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-lg border border-green-500/30 flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="text-6xl mb-4">🎬</div>
                <p className="text-gray-400 text-sm">{step.videoPlaceholder}</p>
                <p className="text-gray-500 text-xs mt-2">Video placeholder</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pagination and Navigation */}
        <div className="flex items-center justify-between mt-20">
          <div className="text-gray-400 text-lg font-mono">[ {step.number} / 03 ]</div>

          <div className="flex gap-4">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:border-green-500 hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentStep(Math.min(2, currentStep + 1))}
              disabled={currentStep === 2}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
