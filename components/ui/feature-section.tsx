"use client"

interface FeatureSectionProps {
  subheading: string
  headline: string
  description: string
  ctaText?: string
  videoPlaceholder: string
  isVideoLeft?: boolean
  accentColor?: "green" | "blue" | "yellow"
}

export function FeatureSection({
  subheading,
  headline,
  description,
  ctaText,
  videoPlaceholder,
  isVideoLeft = false,
  accentColor = "green",
}: FeatureSectionProps) {
  const accentClasses = {
    green: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    yellow: "from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700",
  }

  return (
    <section className="min-h-screen bg-black py-20 px-6 md:px-10 lg:px-14 w-full">
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
          {/* Text Content */}
          <div className={isVideoLeft ? "lg:order-2" : "lg:order-1"}>
            <p className="text-sm font-semibold text-green-400 uppercase tracking-widest mb-4">{subheading}</p>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
              {headline === "Secure cUSD & CELO Management" ? (
                <>
                  Secure <span className="text-blue-400">cUSD</span> & <span className="text-yellow-400">CELO</span> Management
                </>
              ) : (
                headline
              )}
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-lg">{description}</p>
            {ctaText && (
              <button
                className={`px-8 py-3 bg-gradient-to-r ${accentClasses[accentColor]} text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-${accentColor}-500/50`}
              >
                {ctaText}
              </button>
            )}
          </div>

          {/* Video Placeholder */}
          <div className={`${isVideoLeft ? "lg:order-1" : "lg:order-2"} w-full max-w-2xl mx-auto lg:mx-0`}>
            <div className="aspect-video bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-lg border border-green-500/30 flex items-center justify-center min-h-64 max-h-96 w-full">
              <div className="text-center px-4">
                <div className="text-4xl md:text-6xl mb-4">🎬</div>
                <p className="text-gray-400 text-xs md:text-sm break-words">{videoPlaceholder}</p>
                <p className="text-gray-500 text-xs mt-2">Video placeholder</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
