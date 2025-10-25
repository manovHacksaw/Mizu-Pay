import { Navbar } from "@/components/ui/navbar"
import InfiniteHero from "@/components/ui/infinite-hero"
import FeaturesSectionDemo from "@/components/ui/features-section-demo-3"
import { HowItWorksSection } from "@/components/ui/how-it-works-section"
import { FeatureSection } from "@/components/ui/feature-section"
import HoverFooter from "@/components/ui/hover-footer-demo"

export default function Home() {
  return (
    <>
      <Navbar />
      <InfiniteHero />
      <FeaturesSectionDemo />
      <HowItWorksSection />

      <FeatureSection
        subheading="Mizu Wallet"
        headline="Secure cUSD & CELO Management"
        description="We eliminate complexity with features like Gmail login and an easy-to-use, secure wallet setup. Store, manage, and spend your cUSD and CELO with confidence. The future of finance is accessible to everyone."
        ctaText="Launch DApp"
        videoPlaceholder="/videos/wallet-demo.mp4"
        isVideoLeft={true}
        accentColor="green"
      />

      <FeatureSection
        subheading="The Bridge"
        headline="Instant Order Fulfillment Engine"
        description="Mizu Pay securely processes your crypto payment, and our backend instantly purchases a gift card (MVP) or uses API partners (Future) to fulfill your order. Your items are delivered instantly."
        ctaText="How Fulfillment Works"
        videoPlaceholder="/videos/fulfillment-demo.mp4"
        isVideoLeft={false}
        accentColor="blue"
      />

      <HoverFooter />
    </>
  )
}
