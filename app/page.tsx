import { Navbar } from "@/components/ui/navbar"
import InfiniteHero from "@/components/ui/infinite-hero"
import FeaturesSectionDemo from "@/components/ui/features-section-demo-3"
import { HowItWorksSection } from "@/components/ui/how-it-works-section"
import { FeatureSection } from "@/components/ui/feature-section"
import HoverFooter from "@/components/ui/hover-footer"

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black group hover:bg-gradient-to-br hover:from-blue-900/15 hover:via-transparent hover:to-blue-800/10 transition-all duration-1000 ease-out">
      {/* Blue Hover Effect Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ease-out">
        <div 
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, rgba(59, 130, 246, 0.08) 0%, rgba(30, 58, 138, 0.05) 50%, transparent 100%)"
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <InfiniteHero />
        <FeaturesSectionDemo />
        <HowItWorksSection />

        <FeatureSection
          subheading="Mizu Wallet"
          headline="Secure cUSD & CELO Management"
          description="We eliminate complexity with features like Gmail login and an easy-to-use, secure wallet setup. Store, manage, and spend your cUSD and CELO with confidence. The future of finance is accessible to everyone."
          videoPlaceholder="/videos/wallet-demo.mp4"
          isVideoLeft={true}
          accentColor="green"
        />

        <FeatureSection
          subheading="The Bridge"
          headline="Instant Order Fulfillment Engine"
          description="Mizu Pay securely processes your crypto payment, and our backend instantly purchases a gift card (MVP) or uses API partners (Future) to fulfill your order. Your items are delivered instantly."
          videoPlaceholder="/videos/fulfillment-demo.mp4"
          isVideoLeft={false}
          accentColor="blue"
        />

        <HoverFooter />
      </div>
    </div>
  )
}
