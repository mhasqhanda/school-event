"use client"

import { useState, useEffect } from "react"

interface CountdownTimerProps {
  targetDate: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const target = new Date(targetDate).getTime()
      const difference = target - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
        <div className="text-2xl font-bold text-white">{timeLeft.days}</div>
        <div className="text-xs text-gray-300 uppercase tracking-wide">Days</div>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
        <div className="text-2xl font-bold text-white">{timeLeft.hours}</div>
        <div className="text-xs text-gray-300 uppercase tracking-wide">Hours</div>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
        <div className="text-2xl font-bold text-white">{timeLeft.minutes}</div>
        <div className="text-xs text-gray-300 uppercase tracking-wide">Min</div>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
        <div className="text-2xl font-bold text-white">{timeLeft.seconds}</div>
        <div className="text-xs text-gray-300 uppercase tracking-wide">Sec</div>
      </div>
    </div>
  )
}
