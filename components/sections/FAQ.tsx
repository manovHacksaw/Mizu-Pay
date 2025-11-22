"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"

type FAQItem = {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: "What is Mizu Pay?",
    answer:
      "Mizu Pay is an all-in-one crypto payment platform designed to simplify payments, enable instant crypto checkout, track transactions in real-time, and ensure secure, borderless transactions for users across multiple marketplaces.",
  },
  {
    question: "How does Mizu Pay work?",
    answer:
      "Mizu Pay connects your crypto wallet to major online marketplaces. Simply connect your wallet, select CELO or USDC as your payment method, and approve transactions directly from your wallet. No card details, no long forms—just instant crypto payments.",
  },
  {
    question: "Is Mizu Pay secure?",
    answer:
      "Absolutely! Mizu Pay uses blockchain technology to ensure secure transactions. We never store your private keys or sensitive wallet information. All payments are processed directly on the blockchain, giving you full control and security.",
  },
  {
    question: "Can Mizu Pay integrate with other accounting software?",
    answer:
      "Yes, Mizu Pay offers API integrations that allow you to connect with various accounting and financial management tools. Our flexible API makes it easy to sync transaction data with your existing business systems.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="relative w-full overflow-hidden bg-white dark:bg-black py-20 px-6">
      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Side - Heading and Description */}
          <div className="space-y-6">
            {/* Small Label */}
            <div className="inline-flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-md">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path
                  d="M8 3V13M3 8H13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-sm font-medium text-white">Frequently asked questions</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
                Frequently asked
              </h2>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-600 leading-tight">
                questions
              </h2>
            </div>

            {/* Description */}
            <p className="text-base md:text-lg text-gray-600 dark:text-white max-w-lg">
              Choose a plan that fits your business needs and budget. No hidden fees, no surprises—just straightforward pricing for powerful financial management.
            </p>
          </div>

          {/* Right Side - FAQ Accordion */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-5 cursor-pointer transition-all duration-300",
                  openIndex === index ? "bg-gray-100/50 dark:bg-gray-800/50" : "hover:bg-gray-100/30 dark:hover:bg-gray-800/30"
                )}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white flex-1 pr-4">
                    {faq.question}
                  </h3>
                  <div
                    className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center transition-transform duration-300",
                      openIndex === index ? "rotate-180" : ""
                    )}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-white"
                    >
                      <path
                        d="M5 7.5L10 12.5L15 7.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
                <div
                  className={cn(
                    "text-sm md:text-base text-gray-600 dark:text-white transition-all duration-500 ease-in-out overflow-hidden",
                    openIndex === index
                      ? "opacity-100 max-h-[500px] translate-y-0 pt-4"
                      : "opacity-0 max-h-0 -translate-y-2"
                  )}
                >
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

