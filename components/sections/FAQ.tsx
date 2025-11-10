"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"

type FAQItem = {
  question: string
  answer: string
}

type FAQCategory = {
  name: string
  faqs: FAQItem[]
}

const faqCategories: FAQCategory[] = [
  {
    name: "Content",
    faqs: [
      {
        question: "What customization options does Mizu Pay offer for payment processing?",
        answer:
          "Mizu Pay offers extensive customization options including multiple cryptocurrency support (CELO, USDC), customizable payment flows, merchant branding options, and flexible integration APIs. You can tailor the payment experience to match your brand and business needs.",
      },
      {
        question: "Can Mizu Pay process payments in multiple currencies?",
        answer:
          "Yes, Mizu Pay supports multiple cryptocurrencies including CELO and USDC. We're continuously expanding our currency support to provide more payment options for users across different marketplaces.",
      },
      {
        question: "Can Mizu Pay help improve my transaction security?",
        answer:
          "Absolutely! Mizu Pay uses blockchain technology to ensure secure, borderless transactions. Your payments are processed directly from your crypto wallet, eliminating the need to share sensitive card information with merchants.",
      },
      {
        question: "What if the payment doesn't go through?",
        answer:
          "If a payment doesn't go through, Mizu Pay provides detailed error messages and transaction status updates. Our support team is available 24/7 to help resolve any payment issues. Refunds are processed according to each marketplace's return policy.",
      },
    ],
  },
  {
    name: "Billing",
    faqs: [
      {
        question: "What are the transaction fees for using Mizu Pay?",
        answer:
          "Mizu Pay charges minimal transaction fees compared to traditional payment methods. The exact fee depends on the network conditions and transaction size. All fees are transparent and displayed before you confirm your payment.",
      },
      {
        question: "How are refunds processed?",
        answer:
          "Refunds are processed according to each marketplace's return policy. When a refund is issued, it will be sent back to your connected wallet in the same cryptocurrency you used for the original payment.",
      },
    ],
  },
  {
    name: "Plans",
    faqs: [
      {
        question: "What payment plans are available?",
        answer:
          "Mizu Pay offers flexible payment plans for both individual users and merchants. Contact our sales team to learn more about enterprise plans and custom pricing options.",
      },
    ],
  },
  {
    name: "Data Protection",
    faqs: [
      {
        question: "How does Mizu Pay protect my data?",
        answer:
          "Mizu Pay uses blockchain technology and encryption to ensure your data is secure. We never store your private keys or sensitive wallet information. All transactions are processed securely on the blockchain.",
      },
    ],
  },
  {
    name: "Refund / Cancellation",
    faqs: [
      {
        question: "Can I cancel a payment after it's been processed?",
        answer:
          "Once a payment is processed on the blockchain, it cannot be cancelled. However, you can request a refund from the merchant according to their return policy. Refunds will be processed back to your wallet in the same cryptocurrency.",
      },
    ],
  },
]

export function FAQ() {
  const [activeCategory, setActiveCategory] = useState(0)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const currentFAQs = faqCategories[activeCategory].faqs

  return (
    <section className="relative w-full overflow-hidden bg-white py-20 px-6">
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Purple lightning bolt - top left */}
        <div className="absolute top-10 left-10 w-12 h-12 opacity-20">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-purple-500">
            <path
              d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="currentColor"
            />
          </svg>
        </div>
        {/* Blue dot - top right */}
        <div className="absolute top-20 right-20 w-3 h-3 bg-blue-500 rounded-full opacity-30" />
        {/* Purple triangle - left side */}
        <div className="absolute top-1/3 left-16 w-4 h-4 opacity-20">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-purple-500">
            <path d="M12 2L22 20H2L12 2Z" />
          </svg>
        </div>
        {/* Purple star - right side */}
        <div className="absolute top-1/2 right-16 w-4 h-4 opacity-20">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-purple-500">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
        {/* Blue star - left side */}
        <div className="absolute bottom-1/3 left-20 w-4 h-4 opacity-20">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-blue-500">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
        {/* Purple star - bottom right */}
        <div className="absolute bottom-20 right-16 w-4 h-4 opacity-20">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-purple-500">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto flex flex-col items-center">
        {/* Main Title */}
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 text-center mb-8">
          Frequently Asked Questions
        </h2>

        {/* Navigation Tabs */}
        <div className="w-full mb-8 flex justify-center">
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-lg p-1.5 overflow-x-auto">
            {faqCategories.map((category, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveCategory(index)
                  setOpenIndex(null)
                }}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-200",
                  activeCategory === index
                    ? "bg-blue-100 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="w-full space-y-0">
          {currentFAQs.map((faq, index) => (
            <div
              className="border-b border-gray-200 py-5 cursor-pointer w-full group hover:bg-gray-50/50 transition-colors"
              key={index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base md:text-lg font-medium text-slate-900 pr-4 flex-1">
                  {faq.question}
                </h3>
                <div
                  className={cn(
                    "flex-shrink-0 w-6 h-6 flex items-center justify-center transition-transform duration-300",
                    openIndex === index ? "rotate-45" : ""
                  )}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-slate-700"
                  >
                    <path
                      d="M10 4V16M4 10H16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
              <div
                className={cn(
                  "text-sm md:text-base text-slate-600 transition-all duration-500 ease-in-out overflow-hidden",
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
    </section>
  )
}

