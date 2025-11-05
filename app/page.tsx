import { ThemeInit } from "@/components/ThemeInit";
import { PreLoader } from "@/components/PreLoader";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
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
    </>
  );
}
