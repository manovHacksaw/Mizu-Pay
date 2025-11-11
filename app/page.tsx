import { ThemeInit } from "@/components/ThemeInit";
import { PreLoader } from "@/components/PreLoader";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { FeatureClarity } from "@/components/sections/FeatureClarity";
import { ProductSpotlight } from "@/components/sections/ProductSpotlight";
import { PaymentFlow } from "@/components/sections/PaymentFlow";
import { Integrations } from "@/components/sections/Integrations";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { FAQ } from "@/components/sections/FAQ";
import { Footer7 } from "@/components/ui/footer-7";
import { StackFeature } from "@/components/sections/StackFeature";
import { Waves } from "@/components/decorative/Waves";
import { Watermark } from "@/components/decorative/Watermark";
import { LightStreaks } from "@/components/decorative/LightStreaks";

export default function Home() {
  return (
    <>
      <ThemeInit />
      <PreLoader />
      <div className="min-h-screen hero-bg relative overflow-hidden text-primary transition-colors duration-300">
        <LightStreaks />
        <Waves />
        <Watermark />
        <Navbar />
        <Hero />
      </div>
      <FeatureClarity />
      <StackFeature />
      <ProductSpotlight />
      <PaymentFlow />
      <Integrations />
      <HowItWorks />
      <FAQ />
      <Footer7 />
    </>
  );
}
