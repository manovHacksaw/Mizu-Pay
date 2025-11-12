"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa"

interface Footer7Props {
  logo?: {
    url: string
    src: string
    alt: string
    title: string
  }
  sections?: Array<{
    title: string
    links: Array<{ name: string; href: string }>
  }>
  description?: string
  socialLinks?: Array<{
    icon: React.ReactElement
    href: string
    label: string
  }>
  copyright?: string
  legalLinks?: Array<{
    name: string
    href: string
  }>
}

const defaultSections = [
  {
    title: "Product",
    links: [
      { name: "How It Works", href: "#" },
      { name: "Pricing", href: "#" },
      { name: "Marketplaces", href: "#" },
      { name: "Features", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "#" },
      { name: "Team", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Careers", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Help Center", href: "#" },
      { name: "Documentation", href: "#" },
      { name: "API Reference", href: "#" },
      { name: "Privacy", href: "#" },
    ],
  },
]

const defaultSocialLinks = [
  { icon: <FaInstagram className="size-5" />, href: "#", label: "Instagram" },
  { icon: <FaFacebook className="size-5" />, href: "#", label: "Facebook" },
  { icon: <FaTwitter className="size-5" />, href: "#", label: "Twitter" },
  { icon: <FaLinkedin className="size-5" />, href: "#", label: "LinkedIn" },
]

const defaultLegalLinks = [
  { name: "Terms and Conditions", href: "#" },
  { name: "Privacy Policy", href: "#" },
]

export const Footer7 = ({
  logo = {
    url: "/",
    src: "/logo.png",
    alt: "Mizu Pay",
    title: "Mizu Pay",
  },
  sections = defaultSections,
  description = "Innovative crypto payment gateway empowering seamless transactions across India's top marketplaces. Pay with CELO or USDC — fast, secure, and borderless.",
  socialLinks = defaultSocialLinks,
  copyright = "© 2025 Mizu Pay. All rights reserved.",
  legalLinks = defaultLegalLinks,
}: Footer7Props) => {
  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-5">
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
          <div className="flex w-full flex-col justify-between gap-6 lg:items-start">
            {/* Logo */}
            <div className="flex items-center gap-2 lg:justify-start">
              <Link href={logo.url}>
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  title={logo.title}
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              </Link>
              <h2 className="text-xl font-semibold text-slate-900">{logo.title}</h2>
            </div>
            <p className="max-w-[70%] text-sm text-slate-600">{description}</p>
            <ul className="flex items-center space-x-6 text-slate-600">
              {socialLinks.map((social, idx) => (
                <li key={idx} className="font-medium hover:text-indigo-600 transition-colors">
                  <a href={social.href} aria-label={social.label} className="block">
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid w-full gap-6 md:grid-cols-3 lg:gap-20">
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 font-bold text-slate-900">{section.title}</h3>
                <ul className="space-y-3 text-sm text-slate-600">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx} className="font-medium hover:text-indigo-600 transition-colors">
                      <Link href={link.href}>{link.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-col justify-between gap-4 border-t border-slate-200 py-8 text-xs font-medium text-slate-600 md:flex-row md:items-center md:text-left">
          <p className="order-2 lg:order-1">{copyright}</p>
          <ul className="order-1 flex flex-col gap-2 md:order-2 md:flex-row">
            {legalLinks.map((link, idx) => (
              <li key={idx} className="hover:text-indigo-600 transition-colors">
                <Link href={link.href}>{link.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

