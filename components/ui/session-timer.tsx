'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface SessionTimerProps {
  duration: number // in minutes
  onExpire?: () => void
  className?: string
}

export function SessionTimer({ duration, onExpire, className }: SessionTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60) // convert to seconds
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true)
      onExpire?.()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, onExpire])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100
  const isWarning = timeLeft <= 120 // 2 minutes warning
  const isCritical = timeLeft <= 30 // 30 seconds critical

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isExpired ? 'bg-red-500' : isCritical ? 'bg-red-500 animate-pulse' : isWarning ? 'bg-yellow-500' : 'bg-green-500'}`} />
        <span className="text-sm font-medium text-white/70">
          Session expires in
        </span>
      </div>
      
      <motion.div
        className={`px-3 py-1 rounded-full text-sm font-mono ${
          isExpired 
            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
            : isCritical 
            ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' 
            : isWarning 
            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
            : 'bg-green-500/20 text-green-400 border border-green-500/30'
        }`}
        animate={{ scale: isCritical ? [1, 1.05, 1] : 1 }}
        transition={{ duration: 0.5, repeat: isCritical ? Infinity : 0 }}
      >
        {isExpired ? 'EXPIRED' : formatTime(timeLeft)}
      </motion.div>

      {/* Progress bar */}
      <div className="flex-1 max-w-32">
        <div className="w-full bg-white/10 rounded-full h-1.5">
          <motion.div
            className={`h-1.5 rounded-full ${
              isExpired 
                ? 'bg-red-500' 
                : isCritical 
                ? 'bg-red-500' 
                : isWarning 
                ? 'bg-yellow-500' 
                : 'bg-green-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  )
}
