'use client'

import { useEffect, useState } from 'react'

export function ReadingProgressBar() {
  const [completion, setCompletion] = useState(0)

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollHeight > 0) {
        const scrolled = (window.scrollY / scrollHeight) * 100
        setCompletion(Math.min(100, Math.max(0, scrolled)))
      }
    }

    window.addEventListener('scroll', updateScrollProgress, { passive: true })
    updateScrollProgress()

    return () => window.removeEventListener('scroll', updateScrollProgress)
  }, [])

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 z-[60] pointer-events-none bg-transparent"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 transition-all duration-75 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        style={{ width: `${completion}%` }}
      />
    </div>
  )
}
