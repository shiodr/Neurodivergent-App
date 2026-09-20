'use client'

import React, { useState, useEffect } from 'react'
import {
  LifeBuoy,
  HeartHandshake,
  Sparkles,
  RotateCcw,
  Coffee,
  X,
  Heart,
  FileText,
  Volume2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OverwhelmModalProps {
  isOpen: boolean
  currentTime: number
  highContrast: boolean
  reducedMotion?: boolean
  onClose: () => void
  onExplainRecentSimply: () => void
  onRecapRecent: () => void
  onRewindAndSlow: () => void
}

export function OverwhelmModal({
  isOpen,
  currentTime,
  highContrast,
  reducedMotion = false,
  onClose,
  onExplainRecentSimply,
  onRecapRecent,
  onRewindAndSlow,
}: OverwhelmModalProps) {
  const [breathingActive, setBreathingActive] = useState(false)
  const [seconds, setSeconds] = useState(45)
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale')

  // 45-second calming breathing exercise
  useEffect(() => {
    if (!isOpen || !breathingActive) return

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setBreathingActive(false)
          return 45
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, breathingActive])

  useEffect(() => {
    if (!isOpen || !breathingActive) return
    const step = (45 - seconds) % 12
    if (step < 4) setPhase('Inhale')
    else if (step < 8) setPhase('Hold')
    else setPhase('Exhale')
  }, [seconds, isOpen, breathingActive])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Overwhelm and Sensory Learning Support"
    >
      <div
        className={`w-full max-w-lg rounded-3xl border-2 shadow-2xl p-6 sm:p-7 space-y-5 transition-all ${
          highContrast
            ? 'bg-white border-black text-black'
            : 'bg-white border-purple-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-100 text-purple-800">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                Calm Learning Support
              </span>
              <h2 className="text-xl font-black tracking-tight">
                Feeling Stuck or Overwhelmed?
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            aria-label="Close support dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
          It happens to everyone! Video lectures pack a lot of information. Choose how you’d like to slow down:
        </p>

        {breathingActive ? (
          /* Guided Breathing Exercise */
          <div className="py-6 flex flex-col items-center justify-center space-y-4 text-center">
            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center border-4 border-purple-400 bg-purple-50 text-purple-950 font-extrabold text-base transition-all duration-1000 ${
                reducedMotion
                  ? ''
                  : phase === 'Inhale'
                  ? 'scale-125 bg-purple-100 shadow-2xl ring-4 ring-purple-200'
                  : phase === 'Hold'
                  ? 'scale-125 bg-purple-200 shadow-xl'
                  : 'scale-90 bg-purple-50'
              }`}
            >
              <div className="flex flex-col items-center">
                <Heart className="w-6 h-6 text-purple-600 mb-1" />
                <span>{phase}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium max-w-xs">
              Take gentle, deep breaths. There is zero pressure to rush.
            </p>
            <span className="text-xs font-mono font-bold text-purple-800">
              {seconds}s left in pause
            </span>
            <button
              type="button"
              onClick={() => setBreathingActive(false)}
              className="text-xs font-bold text-gray-500 hover:text-gray-900 underline pt-1"
            >
              Back to options
            </button>
          </div>
        ) : (
          /* 4 Immediate Panic-Free Solutions */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Option 1: Simpler explanation */}
            <button
              type="button"
              onClick={() => {
                onClose()
                onExplainRecentSimply()
              }}
              className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                highContrast
                  ? 'bg-white text-black border-black hover:bg-yellow-300'
                  : 'bg-purple-50/80 border-purple-200 text-purple-950 hover:bg-purple-100'
              }`}
            >
              <Sparkles className="w-5 h-5 text-purple-600 mb-2" />
              <div>
                <strong className="text-sm font-bold block mb-0.5">
                  Explain What Just Happened
                </strong>
                <span className="text-xs text-gray-500 leading-tight">
                  Get a plain-English explanation of the recent lesson segment.
                </span>
              </div>
            </button>

            {/* Option 2: 1-sentence recap */}
            <button
              type="button"
              onClick={() => {
                onClose()
                onRecapRecent()
              }}
              className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                highContrast
                  ? 'bg-white text-black border-black hover:bg-yellow-300'
                  : 'bg-blue-50/80 border-blue-200 text-blue-950 hover:bg-blue-100'
              }`}
            >
              <FileText className="w-5 h-5 text-blue-600 mb-2" />
              <div>
                <strong className="text-sm font-bold block mb-0.5">
                  1-Sentence Recap
                </strong>
                <span className="text-xs text-gray-500 leading-tight">
                  High-level summary of the last 2 minutes without details.
                </span>
              </div>
            </button>

            {/* Option 3: Guided 45-second breathing break */}
            <button
              type="button"
              onClick={() => {
                setSeconds(45)
                setBreathingActive(true)
              }}
              className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                highContrast
                  ? 'bg-white text-black border-black hover:bg-yellow-300'
                  : 'bg-emerald-50/80 border-emerald-200 text-emerald-950 hover:bg-emerald-100'
              }`}
            >
              <Heart className="w-5 h-5 text-emerald-600 mb-2" />
              <div>
                <strong className="text-sm font-bold block mb-0.5">
                  Guided Breathing Break
                </strong>
                <span className="text-xs text-gray-500 leading-tight">
                  A calming 45-second sensory pause with zero reading.
                </span>
              </div>
            </button>

            {/* Option 4: Rewind 30s & Slow down to 0.75x */}
            <button
              type="button"
              onClick={() => {
                onClose()
                onRewindAndSlow()
              }}
              className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                highContrast
                  ? 'bg-white text-black border-black hover:bg-yellow-300'
                  : 'bg-amber-50/80 border-amber-200 text-amber-950 hover:bg-amber-100'
              }`}
            >
              <RotateCcw className="w-5 h-5 text-amber-600 mb-2" />
              <div>
                <strong className="text-sm font-bold block mb-0.5">
                  Rewind & Slow Down
                </strong>
                <span className="text-xs text-gray-500 leading-tight">
                  Rewind 30 seconds and switch playback speed to 0.75x.
                </span>
              </div>
            </button>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="font-bold text-xs"
          >
            I&apos;m Feeling Okay, Close This
          </Button>
        </div>
      </div>
    </div>
  )
}
