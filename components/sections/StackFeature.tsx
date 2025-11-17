"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

const iconAssets = [
  { src: "/Amazon-icon.webp", alt: "Amazon" },
  { src: "/bigbasket-logo-removebg.png", alt: "BigBasket" },
  { src: "/Flipkart-icon.webp", alt: "Flipkart" },
  { src: "/meesho-icon.png", alt: "Meesho" },
  { src: "/Myntra-icon-removebg.png", alt: "Myntra" },
  { src: "/Nykaa-icon.png", alt: "Nykaa" },
]

const iconSequence = [0, 3, 1, 4, 2, 5, 0, 4, 1, 3, 2, 5, 4, 0, 2, 3, 1] as const

const iconConfigs = iconSequence.map((index) => iconAssets[index])

export function StackFeature() {
  const [isVisible, setIsVisible] = useState(false)
  const orbitCount = 3
  const orbitGap = 8 // r                         em between orbits
  const iconsPerOrbit = Math.ceil(iconConfigs.length / orbitCount)
  const formatPercent = (value: number) => `${value.toFixed(6)}%`

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section 
      className="relative w-full overflow-hidden px-6 py-16 md:py-24" 
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-indigo-50/20 pointer-events-none" />
      
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 lg:gap-16 lg:flex-row lg:justify-between relative z-10">
        {/* Left side: Enhanced Orbit animation */}
        <div className="relative flex h-[360px] w-full items-center justify-start overflow-hidden lg:h-[480px] lg:w-1/2">
          <div className="relative flex h-[46rem] w-[46rem] -translate-x-[30%] items-center justify-center lg:-translate-x-[35%]">
            {/* Enhanced Center Circle with glow effect */}
            <div 
              className="flex h-48 w-48 items-center justify-center rounded-full bg-gradient-to-br from-white to-blue-50 shadow-2xl ring-4 ring-blue-100/50 transition-all duration-1000"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "scale(1)" : "scale(0.8)",
                boxShadow: "0 20px 60px rgba(10, 77, 255, 0.15), 0 0 40px rgba(10, 77, 255, 0.1)",
              }}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-xl animate-pulse" />
              <Image 
                src="/Mizu-logo.png" 
                alt="Mizu Pay" 
                width={160} 
                height={160} 
                className="h-40 w-40 object-contain relative z-10 drop-shadow-lg" 
              />
            </div>

            {/* Generate Enhanced Orbits */}
            {[...Array(orbitCount)].map((_, orbitIdx) => {
              const size = `${12 + orbitGap * (orbitIdx + 1)}rem`
              const angleStep = (2 * Math.PI) / iconsPerOrbit
              const animationDuration = 12 + orbitIdx * 6
              const reverseDirection = orbitIdx % 2 === 1

              return (
                <div
                  key={orbitIdx}
                  className="absolute rounded-full border-2 border-dotted transition-opacity duration-1000"
                  style={{
                    width: size,
                    height: size,
                    borderColor: `rgba(10, 77, 255, ${0.15 - orbitIdx * 0.03})`,
                    animation: `spin${reverseDirection ? 'Reverse' : ''} ${animationDuration}s linear infinite`,
                    opacity: isVisible ? 1 : 0,
                    transitionDelay: `${orbitIdx * 0.2}s`,
                  }}
                >
                  {iconConfigs
                    .slice(orbitIdx * iconsPerOrbit, orbitIdx * iconsPerOrbit + iconsPerOrbit)
                    .map((cfg, iconIdx) => {
                      const angle = iconIdx * angleStep
                      const x = 50 + 50 * Math.cos(angle)
                      const y = 50 + 50 * Math.sin(angle)

                      return (
                        <div
                          key={iconIdx}
                          className="absolute rounded-full bg-white p-1.5 shadow-lg ring-2 ring-white/90 transition-all duration-300 hover:scale-125 hover:shadow-xl hover:ring-blue-200 group"
                          style={{
                            left: formatPercent(x),
                            top: formatPercent(y),
                            transform: "translate(-50%, -50%)",
                            opacity: isVisible ? 1 : 0,
                            transitionDelay: `${(orbitIdx * 0.3) + (iconIdx * 0.1)}s`,
                          }}
                        >
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <Image
                            src={cfg.src}
                            alt={cfg.alt}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-contain bg-white relative z-10 transition-transform duration-300 group-hover:scale-110"
                            loading="lazy"
                          />
                        </div>
                      )
                    })}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right side: Enhanced Heading and Text */}
        <div 
          className="w-full max-w-lg space-y-6 text-center lg:text-left"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
            transitionDelay: "0.3s",
          }}
        >
          <div className="space-y-5">
          
            
            <h2 
              className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-tight"
              style={{ color: "var(--foreground)" }}
            >
              One Wallet.{' '}
              <span style={{ color: "#0A4DFF" }}>
                Every Store.
              </span>
            </h2>
            
            <p 
              className="text-base sm:text-lg leading-relaxed"
              style={{ color: "var(--content-text-secondary)" }}
            >
              With Mizu Pay, enjoy unified crypto payments across your favorite online marketplaces — simple, fast, and secure.
            </p>

           
          
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes spinReverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
      `}</style>
    </section>
  )
}
