"use client"

import React, { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { motion } from "framer-motion"

export function Integrations() {
  return (
    <section className="relative w-full overflow-hidden bg-white dark:bg-black py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-md px-6 [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_70%,transparent_100%)]">
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="bg-blue-900 dark:bg-blue-950 rounded-xl border border-blue-800 dark:border-blue-900 px-6 pb-12 pt-3 shadow-xl"
          >
            <Integration
              icon={
                <div className="relative size-12 rounded-lg overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-full h-full"
                  >
                    <path
                      d="M19 7H5C3.89543 7 3 7.89543 3 9V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V9C21 7.89543 20.1046 7 19 7Z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="14" r="3" fill="white" />
                  </svg>
                </div>
              }
              name="Mizu Pay Wallet"
              description="Embedded wallet powered by Privy. Perfect for beginners."
              showCursor={true}
            />
            <Integration
              icon={
                <div className="relative size-12 rounded-lg overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="text-white size-6">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
              }
              name="MetaMask"
              description="Connect your existing MetaMask wallet for payments."
            />
            <Integration
              icon={
                <div className="relative size-12 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="text-white size-6">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
              }
              name="WalletConnect"
              description="Use WalletConnect to connect any compatible wallet."
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{
            duration: 0.6,
            delay: 0.2,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mx-auto mt-6 max-w-lg space-y-6 text-center"
        >
          <h2 className="text-balance text-3xl font-semibold text-slate-900 dark:text-white md:text-4xl lg:text-5xl">
            New to crypto? We've got you covered.
          </h2>
          <p className="text-gray-600 dark:text-white text-base md:text-lg">
            Use <span className="text-blue-600 dark:text-blue-400 font-semibold">Mizu Pay Wallet</span> — an embedded wallet powered by Privy, perfect for beginners. No complex setup or
            external extensions. Deposit CELO or cUSD and start paying instantly.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

const Integration = ({
  icon,
  name,
  description,
  showCursor = false,
}: {
  icon: React.ReactNode
  name: string
  description: string
  showCursor?: boolean
}) => {
  const [isClicked, setIsClicked] = useState(false)

  useEffect(() => {
    if (showCursor) {
      // Trigger click state after cursor click completes (at 70% of 2.5s = ~1.75s)
      const clickEndTime = 1750 // Time when click animation completes (70%)
      const animationDuration = 2500 // Total animation duration
      const glowDuration = 600 // How long to keep the glow active
      
      // Function to trigger glow after click
      const triggerGlow = () => {
        setTimeout(() => {
          setIsClicked(true)
          setTimeout(() => {
            setIsClicked(false)
          }, glowDuration)
        }, clickEndTime)
      }
      
      // Initial trigger for first cycle
      triggerGlow()
      
      // Then repeat every animation cycle
      const timer = setInterval(() => {
        triggerGlow()
      }, animationDuration)

      return () => {
        clearInterval(timer)
      }
    }
  }, [showCursor])

  return (
    <>
      {showCursor && (
        <style>{`
          @keyframes cursorMove {
            0% {
              opacity: 0;
              transform: translate(-50%, 0) scale(0.8);
            }
            20% {
              opacity: 1;
            }
            60% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
            65% {
              transform: translate(-50%, -48%) scale(0.95);
            }
            70% {
              transform: translate(-50%, -50%) scale(1);
            }
            80% {
              opacity: 1;
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(1.1);
            }
          }
        `}</style>
      )}
      <div
        className={`relative grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-dashed border-blue-700 py-3 px-2 -mx-2 rounded-lg transition-all duration-500 ${
          showCursor
            ? `group cursor-pointer bg-blue-900 hover:bg-blue-600 hover:border-blue-500 ${
                isClicked
                  ? "bg-blue-500 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6),inset_0_0_20px_rgba(59,130,246,0.2)]"
                  : ""
              }`
            : "last:border-b-0"
        } ${!showCursor ? "last:border-b-0" : ""}`}
      >
        {showCursor && (
          <div
            className="absolute left-1/2 -translate-x-1/2 top-full mt-2 pointer-events-none"
            style={{
              animation: "cursorMove 2.5s ease-in-out infinite",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-lg"
            >
              <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
            </svg>
          </div>
        )}
        <div
          className={`bg-blue-800 border border-blue-700 flex size-12 items-center justify-center rounded-lg transition-all duration-500 ${
            showCursor
              ? `group-hover:bg-blue-500 group-hover:border-blue-400 ${
                  isClicked
                    ? "bg-blue-400 border-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.7)]"
                    : ""
                }`
              : ""
          }`}
        >
          {icon}
        </div>
        <div className="space-y-0.5">
          <h3 className="text-sm font-medium text-white">{name}</h3>
          <p className="text-blue-200 line-clamp-1 text-sm">{description}</p>
        </div>
        <div className="relative">
          <button
            type="button"
            aria-label="Add integration"
            className={`relative flex size-9 items-center justify-center rounded-md border border-blue-700 bg-blue-800 text-white transition-all duration-500 ${
              showCursor
                ? `group-hover:bg-blue-500 group-hover:border-blue-400 hover:bg-blue-400 ${
                    isClicked
                      ? "bg-blue-400 border-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                      : ""
                  }`
                : "hover:bg-blue-700"
            }`}
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </>
  )
}

