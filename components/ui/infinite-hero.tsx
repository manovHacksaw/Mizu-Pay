"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser } from '@clerk/nextjs'

interface HeroProps {
  eyebrow?: string
  title: string
  subtitle: string
  ctaLabel?: string
  ctaHref?: string
}

export default function InfiniteHero({
  eyebrow = "Innovate Without Limits",
  title = "Seamless payments meet sustainable impact.",
  subtitle = "Experience the future of payments with Mizu Pay. Connect your wallets, make payments, and contribute to regenerative finance - all in one platform.",
  ctaLabel = "Get Started",
  ctaHref = "/sign-up",
}: HeroProps) {
  const [mounted, setMounted] = useState(false)
  const { user, isLoaded } = useUser()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section
      id="hero"
      className="relative mx-auto w-full pt-40 px-6 text-center md:px-8 
      min-h-[calc(100vh-40px)] overflow-hidden 
      bg-[linear-gradient(to_bottom,#1a1a1a,#0a0a0a)]  
      dark:bg-[linear-gradient(to_bottom,#1a1a1a,#0a0a0a)] 
      rounded-b-xl"
    >
      {/* Grid BG */}
      <div
        className="absolute -z-10 inset-0 opacity-60 h-[600px] w-full 
        bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)]
        bg-[size:4rem_4rem] 
        [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"
      />

      {/* Radial Accent */}
      <div
        className="absolute left-1/2 top-[calc(100%-120px)] lg:top-[calc(100%-180px)] 
        h-[400px] w-[600px] md:h-[500px] md:w-[800px] lg:h-[600px] lg:w-[1000px] 
        -translate-x-1/2 rounded-[100%] 
        bg-[radial-gradient(ellipse_at_center,#ffffff_0%,#ffffff_20%,transparent_70%)] 
        opacity-80 animate-fade-up"
      />

      {/* Eyebrow */}
      {eyebrow && (
        <a href="#" className="group">
          <span
            className="text-sm text-white/70 font-geist mx-auto px-5 py-2 
            bg-black/20 backdrop-blur-sm
            border-[1px] border-white/10 
            rounded-full w-fit tracking-tight uppercase flex items-center justify-center"
          >
            {eyebrow}
            <ChevronRight className="inline w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </a>
      )}

      {/* Title */}
      <h1
        className="animate-fade-in -translate-y-4 text-balance 
        text-white py-6 text-5xl font-bold leading-none tracking-tighter 
        opacity-0 sm:text-6xl md:text-7xl lg:text-8xl"
      >
        {title}
          </h1>

      {/* Subtitle */}
          <p
        className="animate-fade-in mb-12 -translate-y-4 text-balance 
        text-lg tracking-tight text-white/70 
        opacity-0 md:text-xl"
          >
        {subtitle}
          </p>

      {/* CTA */}
      <div className="flex justify-center">
            {!mounted ? (
              <div className="group relative px-6 py-3 text-sm font-medium tracking-wide text-white/50">
                Loading...
              </div>
            ) : isLoaded && user ? (
          <Button
            asChild
            className="mt-[-20px] w-fit md:w-52 z-20 font-geist tracking-tighter text-center text-lg bg-white text-black hover:bg-white/90"
          >
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        ) : (
          <div className="flex flex-row items-center justify-center gap-4">
            <Button
              asChild
              variant="outline"
              className="mt-[-20px] w-fit md:w-32 z-20 font-geist tracking-tighter text-center text-lg border-white/20 text-white hover:bg-white/10"
            >
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button
              asChild
              className="mt-[-20px] w-fit md:w-52 z-20 font-geist tracking-tighter text-center text-lg bg-white text-black hover:bg-white/90"
            >
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Fade */}
      <div
        className="animate-fade-up relative mt-32 opacity-0 [perspective:2000px] 
        after:absolute after:inset-0 after:z-50 
        after:[background:linear-gradient(to_top,hsl(var(--background))_10%,transparent)]"
      />
    </section>
  )
}
