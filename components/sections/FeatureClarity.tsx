"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

export function FeatureClarity() {
  const pathname = usePathname()
  const isLandingPage = pathname === "/"
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const [isSectionVisible, setIsSectionVisible] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // Only run animations on landing page
    if (!isLandingPage) {
      setIsSectionVisible(true)
      return
    }

    if (!sectionRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsSectionVisible(true)
            if (observerRef.current) {
              observer.unobserve(entry.target)
            }
          }
        })
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px",
      },
    )

    observer.observe(sectionRef.current)
    observerRef.current = observer

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [isLandingPage])

  const renderFirstCardVisual = (isAnimated: boolean, staggerDelay: number = 0) => (
    <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 mb-4 h-48 flex flex-col items-center justify-center overflow-hidden transition-shadow duration-500 ease-in-out hover:shadow-[0_0_25px_rgba(14,118,255,0.22)]">
      {/* Decorative circles */}
      <div className="absolute top-4 left-4 w-16 h-16 bg-white/30 rounded-full"></div>
      <div className="absolute bottom-4 right-4 w-20 h-20 bg-white/20 rounded-full"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white/10 rounded-full"></div>

      {/* Credit Card - animated */}
      <div
        className="relative z-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 w-full max-w-[200px] shadow-lg transition-transform duration-500 ease-in-out hover:scale-[1.05]"
        style={{
          opacity: isAnimated ? 1 : 0,
          transform: isAnimated ? "scale(1)" : "scale(0.2)",
          transition: `opacity 0.6s cubic-bezier(0.3, 0.7, 0.4, 1) ${isAnimated ? `${staggerDelay}s` : "0s"}, transform 0.6s cubic-bezier(0.3, 0.7, 0.4, 1) ${isAnimated ? `${staggerDelay}s` : "0s"}`,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-white text-xs font-semibold">Mizu Pay</span>
          <span className="text-white text-xs font-bold"></span>
        </div>
        <div className="text-white text-xs mb-2"> 132 cUSD</div>
        <div className="text-white text-sm font-mono tracking-wider"> 0xA3F4...98C2 </div>
      </div>

      {/* Currency indicators */}
      <div className="absolute bottom-2 left-4 flex gap-2">
        <div className="bg-white/80 rounded-full px-3 py-1 text-xs font-semibold">cUSD</div>
        <div className="bg-white/80 rounded-full px-3 py-1 text-xs font-semibold">CELO</div>
      </div>
    </div>
  )

  const renderSecondCardVisual = (isAnimated: boolean, staggerDelay: number = 0) => (
    <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 mb-4 h-48 flex flex-col items-center justify-center overflow-hidden transition-shadow duration-500 ease-in-out hover:shadow-[0_0_25px_rgba(14,118,255,0.22)]">
      {/* Decorative circles */}
      <div className="absolute top-4 left-4 w-16 h-16 bg-white/30 rounded-full"></div>
      <div className="absolute bottom-4 right-4 w-20 h-20 bg-white/20 rounded-full"></div>

      {/* Icons */}
      <div className="absolute top-4 right-4 flex gap-2">
        <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
        </div>
        <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center">
          <span className="text-yellow-900 text-xs font-bold">⚡</span>
        </div>
      </div>

      {/* Credit Card - animated */}
      <div
        className="relative z-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 w-full max-w-[180px] shadow-lg rotate-12 transition-all duration-500 ease-in-out hover:scale-[1.04] hover:rotate-[14deg]"
        style={{
          opacity: isAnimated ? 1 : 0,
          transform: isAnimated ? undefined : "rotate(0deg) scale(0.85)",
          transition: `opacity 0.6s ease-out ${isAnimated ? `${staggerDelay}s` : "0s"}, transform 0.6s ease-out ${isAnimated ? `${staggerDelay}s` : "0s"}, rotate 0.3s ease-out, scale 0.3s ease-out`,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-white text-xs font-semibold">Myntra </span>
          <span className="text-white text-xs font-bold">₹3000</span>
        </div>
      </div>

      {/* FX Rate and Speed indicators */}
      <div className="absolute bottom-2 left-4 right-4 flex gap-2">
        <div className="bg-white/90 dark:bg-gray-800/90 rounded px-2 py-1 text-xs font-semibold flex-1">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border-l-2 border-b-2 border-blue-600 dark:border-blue-400 transform rotate-45"></div>
            <span className="text-gray-900 dark:text-white">USD 0.01 = INR 0.089</span>
          </div>
        </div>
        <div className="bg-blue-600 text-white rounded px-2 py-1 text-xs font-semibold flex items-center gap-1">
          <span>10x faster</span>
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
    </div>
  )

  const renderThirdCardVisual = (isAnimated: boolean, staggerDelay: number = 0) => (
    <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 mb-4 h-48 flex flex-col items-center justify-center overflow-hidden transition-shadow duration-500 ease-in-out hover:shadow-[0_0_25px_rgba(14,118,255,0.22)]">
      {/* Decorative circles */}
      <div className="absolute top-4 left-4 w-16 h-16 bg-white/30 rounded-full"></div>
      <div className="absolute bottom-4 right-4 w-20 h-20 bg-white/20 rounded-full"></div>

      {/* Security/Blockchain icons */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
        </div>
        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">🔗</span>
        </div>
      </div>

      {/* Transaction cards - animated */}
      <div
        className="relative z-10 space-y-2 w-full max-w-[220px]"
        style={{
          opacity: isAnimated ? 1 : 0,
          transform: isAnimated ? "translateX(0)" : "translateX(-20px)",
          transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
          transitionDelay: isAnimated ? `${staggerDelay + 0.25}s` : "0s",
        }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-500 ease-in-out hover:translate-y-[-2px] hover:shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-white">SECURE</span>
            <span className="text-xs font-semibold text-green-600">✓</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-white">Blockchain</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">ReFi</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-500 ease-in-out hover:translate-y-[-2px] hover:shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-white">VERIFIED</span>
            <span className="text-xs font-semibold text-green-600">✓</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-white">CELO Network</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">cUSD</span>
          </div>
        </div>
      </div>
    </div>
  )

  const features = [
    {
      title: "Pay with Crypto Anywhere                    ",
      description: "Spend your crypto online without converting it to cash. Just choose an amount and checkout.",
      renderVisual: renderFirstCardVisual,
    },
    {
      title: "Instant Gift Card Delivery",
      description: "Receive your gift card immediately after payment. Redeem it instantly and start shopping.",
      renderVisual: renderSecondCardVisual,
    },
    {
      title: "Simple, Wallet-Based Checkout",
      description: "Connect your wallet and pay in seconds. No KYC, no sign-ups, no complexity.",
      renderVisual: renderThirdCardVisual,
    },
  ]

  return (
    <section ref={sectionRef} className="relative py-12 md:py-16 px-5 bg-white dark:bg-black">
      <div className="max-w-6xl mx-auto">
        {/* Tagline */}
        <div className="text-center mb-4">
          <span
            className="inline-flex items-center gap-2 text-sm md:text-base font-medium text-gray-600 dark:text-white"
          >
            <span className="text-yellow-500">⚡</span>
            Built for fast-growing teams
          </span>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => {
            // Only use stagger delays on landing page
            const cardStaggerDelay = isLandingPage ? index * 0.9 : 0
            const isAnimated = isSectionVisible

            return (
              <div
                key={index}
                className="card-bg rounded-xl p-5 md:p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                style={{
                  opacity: isAnimated ? 1 : 0,
                  transform: isAnimated ? "translateY(0)" : "translateY(15px)",
                  transition: `opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)`,
                  transitionDelay: isAnimated && isLandingPage ? `${cardStaggerDelay}s` : "0s",
                }}
              >
                {/* Visual */}
                {feature.renderVisual(isAnimated, cardStaggerDelay)}

                {/* Title */}
                <h3
                  className="text-lg md:text-xl font-bold mb-2"
                  style={{
                    color: "var(--foreground)",
                    opacity: isAnimated ? 1 : 0,
                    transform: isAnimated ? "translateY(0)" : "translateY(12px)",
                    transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
                    transitionDelay: isAnimated && isLandingPage ? `${cardStaggerDelay + 0.8}s` : "0s",
                  }}
                >
                  {feature.title}
                </h3>

                {/* Description */}
                <p
                  className="text-sm md:text-base leading-relaxed text-gray-600 dark:text-white"
                  style={{
                    opacity: isAnimated ? 1 : 0,
                    transform: isAnimated ? "translateY(0)" : "translateY(16px)",
                    transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
                    transitionDelay: isAnimated && isLandingPage ? `${cardStaggerDelay + 0.8 + 0.4 + 0.15}s` : "0s",
                  }}
                >
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
