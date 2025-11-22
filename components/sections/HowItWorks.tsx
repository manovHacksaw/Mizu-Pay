"use client"

import React from "react"
import { motion } from "framer-motion"
import { StaggerHowItWorks } from "@/components/ui/stagger-how-it-works"

export function HowItWorks() {
  return (
    <section className="relative w-full overflow-hidden bg-background py-32 px-6 transition-colors duration-300">
      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 transition-colors duration-300">
            Start Your Crypto Journey in 8 Simple Steps
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto transition-colors duration-300">
            Mizu Pay brings everything together in one intelligent platform that understands crypto payments, not just
            transactions. Our system creates payments that are actually secure, blockchain-verified, and designed for
            seamless e-commerce integration.
          </p>
        </motion.div>

        <div className="relative max-w-6xl mx-auto">
          <StaggerHowItWorks />
        </div>
      </div>
    </section>
  )
}

