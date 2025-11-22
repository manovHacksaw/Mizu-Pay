"use client"

import React, { useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

type StepCard = {
  number: string
  title: string
  description: string
}

const steps: StepCard[] = [
  {
    number: "01",
    title: "Checkout with Mizu Pay",
    description:
      "When you're shopping on your favorite e-commerce site (like Amazon, Flipkart, or Myntra), choose \"Pay with Crypto (via Mizu Pay)\" during checkout. Our browser extension detects the purchase and opens the Mizu Pay payment page automatically.",
  },
  {
    number: "02",
    title: "Quick Login & Authentication",
    description:
      "If you're new to Mizu Pay, simply log in using your email — no complex wallet setup required. Returning users are recognized instantly.",
  },
  {
    number: "03",
    title: "Choose Your Wallet",
    description:
      "Select how you want to pay: Mizu Pay Wallet (embedded wallet managed by Privy — ideal for beginners) or your existing crypto wallet (for regular Web3 users). You can pay using CELO or cUSD/USDC directly.",
  },
  {
    number: "04",
    title: "Smart Price Match",
    description:
      "Mizu Pay automatically finds the closest gift card value matching your purchase amount (e.g., ₹750 → ₹1000 gift card). You'll see the final payable amount before confirming.",
  },
  {
    number: "05",
    title: "Secure On-Chain Payment",
    description:
      "Click Pay, confirm the transaction in your wallet, and your payment is processed on-chain. Every payment is transparent and traceable — no middlemen.",
  },
  {
    number: "06",
    title: "Blockchain Validation",
    description:
      "Mizu Pay's backend verifies your payment using blockchain events to ensure: The correct wallet and amount, and the right currency. Once validated, your payment is marked as successful.",
  },
  {
    number: "07",
    title: "Instant Gift Card Delivery",
    description:
      "After successful payment, a gift card code is automatically requested from our partner provider. It's stored securely and delivered to you via email and your dashboard.",
  },
  {
    number: "08",
    title: "Dashboard & History",
    description:
      "Track all your purchases easily from the Mizu Pay Dashboard: View active wallet balance, see past transactions and timestamps, and access gift card details and redemption info.",
  },
]

function StepCard({ step, index }: { step: StepCard; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)

  // Calculate diagonal positioning - cards arranged diagonally from top-left to bottom-right
  const cardWidth = 420 // Card width in pixels
  const cardHeight = 500 // Approximate card height
  const horizontalSpacing = 80 // Space between cards horizontally
  const verticalSpacing = 60 // Space between cards vertically (diagonal effect)
  
  // Horizontal position increases from left to right
  const xOffset = index * (cardWidth + horizontalSpacing)
  
  // Vertical position increases to create smooth diagonal line from top-left to bottom-right
  const yOffset = index * verticalSpacing
  
  // Rotation varies: alternating between left and right tilts for visual interest
  // Even indices tilt slightly left, odd indices tilt slightly right
  const rotation = index % 2 === 0 ? -2.5 : 2.5

  const zIndex = steps.length - index

  const gradients = [
    "from-blue-900 via-blue-800 to-indigo-900",
    "from-indigo-900 via-blue-800 to-blue-900",
    "from-blue-800 via-indigo-800 to-blue-900",
    "from-indigo-800 via-blue-900 to-indigo-900",
    "from-blue-900 via-blue-800 to-indigo-800",
    "from-indigo-900 via-blue-900 to-blue-800",
    "from-blue-800 via-indigo-900 to-blue-900",
    "from-indigo-800 via-blue-800 to-indigo-900",
  ]

  useEffect(() => {
    if (!cardRef.current) return

    const card = cardRef.current

    gsap.fromTo(
      card,
      {
        opacity: 0,
        y: 100 + index * 30,
        scale: 0.85,
        rotation: rotation + 5,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotation: rotation,
        duration: 1,
        delay: index * 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          end: "top 20%",
          scrub: false,
        },
      }
    )
  }, [index, rotation])

  return (
    <div
      ref={cardRef}
      className="absolute"
      style={{
        left: `${xOffset}px`,
        top: `${yOffset}px`,
        transform: `rotate(${rotation}deg)`,
        zIndex,
      }}
    >
      <div
        className={`relative w-[380px] md:w-[420px] rounded-2xl p-8 bg-gradient-to-br ${gradients[index]} text-white shadow-2xl overflow-hidden`}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-[radial-gradient(circle,rgba(255,255,255,0.1),transparent_70%)] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[radial-gradient(circle,rgba(255,255,255,0.08),transparent_70%)] translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative z-10">
          <div className="text-7xl md:text-8xl font-bold mb-4 opacity-80 leading-none">{step.number}</div>
          <h3 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">{step.title}</h3>
          <p className="text-base md:text-lg text-white/90 mb-6 leading-relaxed">{step.description}</p>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white font-medium transition-colors group"
          >
            Learn more
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <section ref={containerRef} className="relative w-full overflow-hidden bg-white dark:bg-black py-32 px-6">
      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
          Start Your Crypto Journey in 8 Simple Steps
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-white max-w-3xl mx-auto">
            Mizu Pay brings everything together in one intelligent platform that understands crypto payments, not just
            transactions. Our system creates payments that are actually secure, blockchain-verified, and designed for
            seamless e-commerce integration.
          </p>
        </motion.div>

        <div className="relative min-h-[900px] md:min-h-[1000px] overflow-x-auto px-4">
          <div 
            className="relative mx-auto" 
            style={{ 
              width: "fit-content", 
              minWidth: `${steps.length * 500}px`, 
              height: `${300 + steps.length * 60}px`,
              paddingTop: "50px"
            }}
          >
            {steps.map((step, index) => (
              <StepCard key={index} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

