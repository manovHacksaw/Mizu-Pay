"use client"

import React, { useRef } from "react"
import ScrollFloat from "@/components/ui/scroll-float"

export function ScrollText() {
  const containerRef = useRef<HTMLDivElement>(null)
  const firstTextRef = useRef<HTMLDivElement>(null)
  const secondTextRef = useRef<HTMLDivElement>(null)

  return (
    <section className="relative w-full min-h-[200vh] flex flex-col items-center justify-center py-32 px-6 bg-white">
      <div ref={containerRef} className="w-full max-w-6xl mx-auto text-center">
        <div ref={firstTextRef} className="min-h-[50vh] flex items-center justify-center">
          <ScrollFloat
            scrollContainerRef={containerRef as React.RefObject<HTMLElement>}
            containerClassName="mb-8"
            textClassName="font-bold text-slate-900"
            scrollStart="center bottom+=50%"
            scrollEnd="bottom bottom-=40%"
          >
          No more holding.
          </ScrollFloat>
        </div>

        <div ref={secondTextRef} className="min-h-[50vh] flex items-center justify-center">
          <ScrollFloat
            scrollContainerRef={containerRef as React.RefObject<HTMLElement>}
            containerClassName="mt-8"
            textClassName="font-bold text-slate-900"
            scrollStart="center bottom+=50%"
            scrollEnd="bottom bottom-=40%"
          >
          Start living your crypto.
          </ScrollFloat>
        </div>
      </div>
    </section>
  )
}

