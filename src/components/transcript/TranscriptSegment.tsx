'use client'

import React from 'react'
import { Clock } from 'lucide-react'
import { formatTime, cn } from '@/lib/utils'
import type { TranscriptSegment as SegmentType, KeyTermData, TextSize } from '@/types'

interface TranscriptSegmentProps {
  segment: SegmentType
  isActive: boolean
  keyTerms: KeyTermData[]
  textSize: TextSize
  highContrast: boolean
  onSeek: (time: number) => void
  onSelectTerm: (term: KeyTermData) => void
}

export function TranscriptSegment({
  segment,
  isActive,
  keyTerms,
  textSize,
  highContrast,
  onSeek,
  onSelectTerm,
}: TranscriptSegmentProps) {
  const textSizeClasses = {
    small: 'text-sm leading-relaxed',
    medium: 'text-base leading-relaxed',
    large: 'text-lg leading-loose',
    'extra-large': 'text-xl leading-loose font-medium',
  }

  // Highlight key terms inside the text
  const renderHighlightedText = (text: string) => {
    if (!keyTerms || keyTerms.length === 0) return text

    // Sort terms by length descending to match longest matches first
    const sortedTerms = [...keyTerms].sort((a, b) => b.term.length - a.term.length)
    const escapedTerms = sortedTerms.map((t) =>
      t.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    )
    const regex = new RegExp(`\\b(${escapedTerms.join('|')})\\b`, 'gi')

    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index
      const matchedTerm = match[0]

      if (matchIndex > lastIndex) {
        parts.push(text.substring(lastIndex, matchIndex))
      }

      const foundKeyTerm = keyTerms.find(
        (k) => k.term.toLowerCase() === matchedTerm.toLowerCase()
      )

      if (foundKeyTerm) {
        parts.push(
          <button
            key={`${foundKeyTerm.id}-${matchIndex}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onSelectTerm(foundKeyTerm)
            }}
            className={cn(
              'inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded font-semibold transition-all underline decoration-2 decoration-blue-500 underline-offset-2',
              highContrast
                ? 'bg-yellow-300 text-black border border-black hover:bg-yellow-400'
                : 'bg-blue-100 text-blue-900 hover:bg-blue-200 focus:ring-2 focus:ring-blue-500'
            )}
            title={`Click to read simplified explanation for "${foundKeyTerm.term}"`}
            aria-label={`Key term ${foundKeyTerm.term}. Click for explanation.`}
          >
            {matchedTerm}
          </button>
        )
      } else {
        parts.push(matchedTerm)
      }

      lastIndex = matchIndex + matchedTerm.length
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }

    return parts
  }

  return (
    <div
      onClick={() => onSeek(segment.startTime)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSeek(segment.startTime)
        }
      }}
      className={cn(
        'group relative p-3 sm:p-4 rounded-xl transition-all text-left cursor-pointer border-2 focus:outline-none focus:ring-3 focus:ring-blue-500',
        isActive
          ? highContrast
            ? 'bg-black text-white border-yellow-400 shadow-md'
            : 'bg-blue-50/90 text-blue-950 border-blue-400 shadow-sm'
          : highContrast
          ? 'bg-white text-black border-gray-400 hover:border-black'
          : 'bg-white text-gray-800 border-gray-100 hover:border-gray-300 hover:bg-gray-50/70'
      )}
      aria-current={isActive ? 'true' : undefined}
      aria-label={`Jump to ${formatTime(segment.startTime)}: ${segment.text}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-xs font-bold tracking-wide',
            isActive
              ? highContrast
                ? 'bg-yellow-400 text-black'
                : 'bg-blue-600 text-white'
              : highContrast
              ? 'bg-gray-200 text-black'
              : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
          )}
        >
          <Clock className="w-3 h-3" />
          {formatTime(segment.startTime)}
        </span>

        {isActive && (
          <span
            className={cn(
              'text-xs font-bold px-2 py-0.5 rounded',
              highContrast ? 'bg-yellow-400 text-black' : 'text-blue-700 bg-blue-100'
            )}
          >
            Speaking Now
          </span>
        )}
      </div>

      <p className={cn(textSizeClasses[textSize], 'select-text')}>
        {renderHighlightedText(segment.text)}
      </p>
    </div>
  )
}
