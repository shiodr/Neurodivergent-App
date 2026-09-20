'use client'

import React, { useState } from 'react'
import {
  Compass,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Sparkles,
} from 'lucide-react'
import { speakText, stopSpeech, isCurrentlySpeaking } from '@/lib/tts'
import { formatTime } from '@/lib/utils'
import type { ChapterData } from '@/types'

interface LessonSummaryPrimerProps {
  summary: string | null | undefined
  chapters?: ChapterData[]
  highContrast: boolean
  onSeekToChapter?: (time: number) => void
}

export function LessonSummaryPrimer({
  summary,
  chapters = [],
  highContrast,
  onSeekToChapter,
}: LessonSummaryPrimerProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)

  if (!summary && chapters.length === 0) return null

  const handleToggleSpeak = () => {
    if (isSpeaking && isCurrentlySpeaking()) {
      stopSpeech()
      setIsSpeaking(false)
    } else {
      stopSpeech()
      setIsSpeaking(true)
      const textToRead = summary || 'Lesson overview and chapters.'
      speakText(textToRead, () => {
        setIsSpeaking(false)
      })
    }
  }

  return (
    <div
      className={`rounded-2xl border-2 transition-all overflow-hidden shadow-xs ${
        highContrast
          ? 'bg-white border-black text-black'
          : 'bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/70 border-indigo-100 text-slate-800'
      }`}
      role="region"
      aria-label="Pre-Lesson Primer and Overview"
    >
      {/* Primer Header */}
      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold tracking-tight flex items-center gap-1.5">
              <span>Lesson Primer</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Consume First
              </span>
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              A quick calm overview before watching.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {summary && (
            <button
              type="button"
              onClick={handleToggleSpeak}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                isSpeaking
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-2 ring-emerald-400'
                  : highContrast
                  ? 'bg-white text-black border-black hover:bg-gray-100'
                  : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
              }`}
              aria-label={isSpeaking ? 'Stop listening to primer' : 'Listen to primer overview'}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Listen</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-black/5"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Collapse primer' : 'Expand primer'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-3.5 sm:px-4 pb-4 pt-1 space-y-3 border-t border-indigo-100/60">
          {summary && (
            <p className="text-xs sm:text-sm leading-relaxed font-medium text-gray-700">
              {summary}
            </p>
          )}

          {/* Chapter Quick Links */}
          {chapters.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
                Key Topics & Chapters:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {chapters.map((ch) => (
                  <button
                    key={ch.id || ch.index}
                    type="button"
                    onClick={() => onSeekToChapter?.(ch.startTime)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                      highContrast
                        ? 'bg-white text-black border-black hover:bg-yellow-300'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-700 shadow-xs'
                    }`}
                  >
                    <PlayCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="font-mono text-[11px] text-gray-400">
                      {formatTime(ch.startTime)}
                    </span>
                    <span>{ch.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
