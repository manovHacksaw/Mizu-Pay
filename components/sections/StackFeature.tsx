"use client"

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
  const orbitCount = 3
  const orbitGap = 8 // rem between orbits
  const iconsPerOrbit = Math.ceil(iconConfigs.length / orbitCount)
  const formatPercent = (value: number) => `${value.toFixed(6)}%`

  return (
    <section className="relative my-32 w-full overflow-hidden px-6 py-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 lg:flex-row lg:justify-between">
        {/* Left side: Orbit animation cropped to 1/4 */}
        <div className="relative flex h-[360px] w-full items-center justify-start overflow-hidden lg:h-[420px] lg:w-1/2">
          <div className="relative flex h-[46rem] w-[46rem] -translate-x-[40%] items-center justify-center lg:-translate-x-[45%]">
            {/* Center Circle */}
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-xl ring-8 ring-indigo-100">
              <Image src="/logo.png" alt="Mizu Pay" width={56} height={56} className="h-14 w-14 object-contain" />
            </div>

            {/* Generate Orbits */}
            {[...Array(orbitCount)].map((_, orbitIdx) => {
              const size = `${12 + orbitGap * (orbitIdx + 1)}rem` // equal spacing
              const angleStep = (2 * Math.PI) / iconsPerOrbit

              return (
                <div
                  key={orbitIdx}
                  className="absolute rounded-full border-2 border-dotted border-slate-200"
                  style={{
                    width: size,
                    height: size,
                    animation: `spin ${12 + orbitIdx * 6}s linear infinite`,
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
                          className="absolute rounded-full bg-white p-1 shadow-md ring-2 ring-white/80"
                          style={{
                            left: formatPercent(x),
                            top: formatPercent(y),
                            transform: "translate(-50%, -50%)",
                          }}
                        >
                          <Image
                            src={cfg.src}
                            alt={cfg.alt}
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-full object-contain bg-white"
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

        {/* Right side: Heading and Text */}
        <div className="w-full max-w-lg space-y-6 text-center lg:text-left">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            One Wallet. Every Store.
            </h2>
            <p className="text-base text-slate-600 sm:text-lg">
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
      `}</style>
    </section>
  )
}
