"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { useUser } from '@clerk/nextjs'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user, isLoaded } = useUser()

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <div className="flex justify-center w-full py-6 px-4 fixed top-0 left-0 right-0 z-40">
      <div className="flex items-center justify-between px-6 py-3 bg-white rounded-full shadow-lg w-full max-w-3xl relative z-10">
        <div className="flex items-center">
          <motion.div
            className="w-8 h-8 mr-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            whileHover={{ rotate: 10 }}
            transition={{ duration: 0.3 }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="url(#paint0_linear)" />
              <text x="16" y="20" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white" fontFamily="Arial">
                M
              </text>
              <defs>
                <linearGradient id="paint0_linear" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00D4FF" />
                  <stop offset="1" stopColor="#0099CC" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          <span className="font-bold text-gray-900">Mizu Pay</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {["Features", "How It Works", "Impact", "Docs"].map((item) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <a href="#" className="text-sm text-gray-900 hover:text-gray-600 transition-colors font-medium">
                {item}
              </a>
            </motion.div>
          ))}
        </nav>

        {/* Desktop CTA Buttons */}
        <motion.div
          className="hidden md:flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {!mounted ? (
            <div className="inline-flex items-center justify-center px-5 py-2 text-sm text-gray-400">
              Loading...
            </div>
          ) : isLoaded && user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-5 py-2 text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center px-5 py-2 text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </motion.div>

        {/* Mobile Menu Button */}
        <motion.button className="md:hidden flex items-center" onClick={toggleMenu} whileTap={{ scale: 0.9 }}>
          <Menu className="h-6 w-6 text-gray-900" />
        </motion.button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-white z-50 pt-24 px-6 md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <motion.button
              className="absolute top-6 right-6 p-2"
              onClick={toggleMenu}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <X className="h-6 w-6 text-gray-900" />
            </motion.button>
            <div className="flex flex-col space-y-6">
              {["Features", "How It Works", "Impact", "Docs"].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.1 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <a href="#" className="text-base text-gray-900 font-medium" onClick={toggleMenu}>
                    {item}
                  </a>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                exit={{ opacity: 0, y: 20 }}
                className="pt-6 space-y-3"
              >
                {!mounted ? (
                  <div className="inline-flex items-center justify-center w-full px-5 py-3 text-base text-gray-400">
                    Loading...
                  </div>
                ) : isLoaded && user ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center w-full px-5 py-3 text-base text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                    onClick={toggleMenu}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/sign-in"
                      className="inline-flex items-center justify-center w-full px-5 py-3 text-base text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-all"
                      onClick={toggleMenu}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/sign-up"
                      className="inline-flex items-center justify-center w-full px-5 py-3 text-base text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                      onClick={toggleMenu}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { Navbar }
