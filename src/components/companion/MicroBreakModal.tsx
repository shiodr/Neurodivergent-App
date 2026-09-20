'use client'

import React, { useState, useEffect } from 'react'
import {
  Coffee,
  CheckCircle2,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Heart,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatTime } from '@/lib/utils'

interface MicroBreakModalProps {
  isOpen: boolean
  currentTime: number
  currentChapterTitle?: string
  highContrast: boolean
  reducedMotion?: boolean
  onResume: () => void
  onAskSimpler: () => void
  onPracticeCheck: () => void
}

export function MicroBreakModal({
  isOpen,
  currentTime,
  currentChapterTitle,
  highContrast,
  reducedMotion = false,
  onResume,
  onAskSimpler,
  onPracticeCheck,
}: MicroBreakModalProps) {
  const [inBreathingMode, setInBreathingMode] = useState(false)
  const [breathingSecondsLeft, setBreathingSecondsLeft] = useState(30)
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale')

  // 30-second breathing timer
  useEffect(() => {
    if (!isOpen || !inBreathingMode) return

    const interval = setInterval(() => {
      setBreathingSecondsLeft((prev) => {
        if (prev <= 1) {
          setInBreathingMode(false)
          return 30
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isOpen, inBreathingMode])

  // 4-4-4 box breathing cycle
  useEffect(() => {
    if (!isOpen || !inBreathingMode) return

    const cycle = (30 - breathingSecondsLeft) % 12
    if (cycle < 4) {
      setBreathingPhase('Inhale')
    } else if (cycle < 8) {
      setBreathingPhase('Hold')
    } else {
      setBreathingPhase('Exhale')
    }
  }, [breathingSecondsLeft, isOpen, inBreathingMode])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Micro-learning Break Checkpoint"
    >
      <div
        className={`w-full max-w-lg rounded-3xl border-2 shadow-2xl p-6 sm:p-7 space-y-5 transition-all ${
          highContrast
            ? 'bg-white border-black text-black'
            : 'bg-white border-blue-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-100 text-amber-800">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Gentle Checkpoint
              </span>
              <h2 className="text-xl font-black tracking-tight">
                Great job! Ready for a quick breath?
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onResume}
            className="p-1 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            aria-label="Close pause card and continue"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saved Progress Reassurance */}
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
            highContrast
              ? 'bg-yellow-100 text-black border-black'
              : 'bg-emerald-50 text-emerald-900 border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Progress automatically saved at {formatTime(currentTime)}</span>
          </div>
          {currentChapterTitle && (
            <span className="text-emerald-700 font-bold truncate max-w-[140px]">
              {currentChapterTitle}
            </span>
          )}
        </div>

        {/* Breathing Sensory Break Mode */}
        {inBreathingMode ? (
          <div className="py-6 flex flex-col items-center justify-center space-y-4 text-center">
            <div
              className={`w-28 h-28 rounded-full flex items-center justify-center border-4 border-teal-300 bg-teal-50 text-teal-900 font-extrabold text-sm transition-all duration-1000 ${
                reducedMotion
                  ? ''
                  : breathingPhase === 'Inhale'
                  ? 'scale-125 bg-teal-100 shadow-xl'
                  : breathingPhase === 'Hold'
                  ? 'scale-125 bg-teal-200 shadow-lg ring-4 ring-teal-200/50'
                  : 'scale-90 bg-teal-50'
              }`}
            >
              <div className="flex flex-col items-center">
                <Heart className="w-5 h-5 text-teal-600 mb-1" />
                <span>{breathingPhase}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Softly follow the circle: breathe in, hold gently, breathe out.
            </p>
            <span className="text-xs font-mono font-bold text-teal-800">
              {breathingSecondsLeft}s remaining
            </span>
            <button
              type="button"
              onClick={() => setInBreathingMode(false)}
              className="text-xs font-bold text-gray-500 hover:text-gray-900 underline"
            >
              End sensory pause early
            </button>
          </div>
        ) : (
          /* Normal Pause Options */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {/* Option 1: 30-sec sensory break */}
            <button
              type="button"
              onClick={() => {
                setBreathingSecondsLeft(30)
                setInBreathingMode(true)
              }}
              className={`p-3.5 rounded-2xl border-2 text-left flex flex-col justify-between transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                highContrast
                  ? 'bg-white text-black border-black hover:bg-yellow-300'
                  : 'bg-teal-50/70 border-teal-200 text-teal-950 hover:bg-teal-100'
              }`}
            >
              <Heart className="w-5 h-5 text-teal-600 mb-2" />
              <div>
                <strong className="text-xs font-bold block">30s Breath Pause</strong>
                <span className="text-[11px] text-gray-500 leading-tight">
                  Calm eye & brain rest
                </span>
              </div>
            </button>

            {/* Option 2: Simpler explanation */}
            <button
              type="button"
              onClick={() => {
                onResume()
                onAskSimpler()
              }}
              className={`p-3.5 rounded-2xl border-2 text-left flex flex-col justify-between transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                highContrast
                  ? 'bg-white text-black border-black hover:bg-yellow-300'
                  : 'bg-purple-50/70 border-purple-200 text-purple-950 hover:bg-purple-100'
              }`}
            >
              <Sparkles className="w-5 h-5 text-purple-600 mb-2" />
              <div>
                <strong className="text-xs font-bold block">Simplify What Was Said</strong>
                <span className="text-[11px] text-gray-500 leading-tight">
                  Ask AI helper to break it down
                </span>
              </div>
            </button>

            {/* Option 3: Quick Practice Check */}
            <button
              type="button"
              onClick={() => {
                onResume()
                onPracticeCheck()
              }}
              className={`p-3.5 rounded-2xl border-2 text-left flex flex-col justify-between transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                highContrast
                  ? 'bg-white text-black border-black hover:bg-yellow-300'
                  : 'bg-blue-50/70 border-blue-200 text-blue-950 hover:bg-blue-100'
              }`}
            >
              <HelpCircle className="w-5 h-5 text-blue-600 mb-2" />
              <div>
                <strong className="text-xs font-bold block">Quick Quiz Check</strong>
                <span className="text-[11px] text-gray-500 leading-tight">
                  Test understanding
                </span>
              </div>
            </button>
          </div>
        )}

        {/* Primary Resume Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center sm:text-left">
            Ready to jump back in whenever you are!
          </p>
          <Button
            onClick={onResume}
            size="lg"
            className="w-full sm:w-auto font-black text-sm gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Continue Watching</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
