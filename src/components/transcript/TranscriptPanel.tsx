'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Search, X, Sparkles, BookOpen, Volume2, Lightbulb, Compass } from 'lucide-react'
import { TranscriptSegment } from './TranscriptSegment'
import { Button } from '@/components/ui/button'
import { speakText } from '@/lib/tts'
import type { TranscriptSegment as SegmentType, KeyTermData, TextSize } from '@/types'

interface TranscriptPanelProps {
  segments: SegmentType[]
  activeSegmentIndex: number
  currentTime: number
  keyTerms: KeyTermData[]
  textSize: TextSize
  highContrast: boolean
  onSeek: (time: number) => void
  onSelectTerm: (term: KeyTermData) => void
  onExplainSelection: (text: string, mode?: 'simple' | 'analogy' | 'deep' | 'age-10') => void
}

export function TranscriptPanel({
  segments,
  activeSegmentIndex,
  keyTerms,
  textSize,
  highContrast,
  onSeek,
  onSelectTerm,
  onExplainSelection,
}: TranscriptPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedText, setSelectedText] = useState('')
  const [showExplainButton, setShowExplainButton] = useState(false)
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null)
  const activeItemRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll active segment into comfortable view
  useEffect(() => {
    if (activeItemRef.current && containerRef.current) {
      const container = containerRef.current
      const element = activeItemRef.current
      const containerRect = container.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()

      if (elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }, [activeSegmentIndex])

  // Filter segments based on search
  const filteredSegments = segments.filter((seg) =>
    seg.text.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Text selection handler for on-demand explanation
  const handleMouseUp = () => {
    const selection = window.getSelection()
    const text = selection?.toString().trim()

    if (text && text.length > 2 && text.length < 150) {
      setSelectedText(text)
      const range = selection?.getRangeAt(0)
      const rect = range?.getBoundingClientRect()
      if (rect) {
        setSelectionPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        })
        setShowExplainButton(true)
      }
    } else {
      setShowExplainButton(false)
    }
  }

  const handleExplainCurrentSelection = (mode: 'simple' | 'analogy' | 'deep' | 'age-10' = 'simple') => {
    if (selectedText) {
      onExplainSelection(selectedText, mode)
      setShowExplainButton(false)
      window.getSelection()?.removeAllRanges()
    }
  }

  const handleListenSelection = () => {
    if (selectedText) {
      speakText(selectedText)
      setShowExplainButton(false)
      window.getSelection()?.removeAllRanges()
    }
  }

  return (
    <section
      className={`flex flex-col h-full rounded-2xl border-2 overflow-hidden shadow-sm ${
        highContrast ? 'bg-white border-black' : 'bg-gray-50/50 border-gray-200'
      }`}
      aria-label="Synchronized Lesson Transcript"
    >
      {/* Header & Search */}
      <div
        className={`p-4 border-b-2 flex flex-col gap-3 ${
          highContrast ? 'bg-black text-white border-black' : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold tracking-tight">Interactive Transcript</h2>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 font-semibold">
            {filteredSegments.length} segments
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <label htmlFor="transcript-search" className="sr-only">
            Search in transcript
          </label>
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="transcript-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords in lesson..."
            className={`w-full pl-10 pr-10 py-2 rounded-xl text-sm border-2 transition-all focus:outline-none focus:ring-3 focus:ring-blue-400 ${
              highContrast
                ? 'bg-white text-black border-gray-700 placeholder-gray-500'
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Floating Action Toolbar for selected text */}
      {showExplainButton && selectionPosition && (
        <div
          style={{
            position: 'fixed',
            left: `${selectionPosition.x}px`,
            top: `${selectionPosition.y}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 9999,
          }}
          className="animate-in fade-in zoom-in-90 duration-150 shadow-2xl bg-gray-900 text-white rounded-2xl p-1.5 flex items-center gap-1 border-2 border-white/40"
        >
          <button
            type="button"
            onClick={() => handleExplainCurrentSelection('simple')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs"
            title="Explain this phrase simply"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Explain</span>
          </button>

          <button
            type="button"
            onClick={() => handleExplainCurrentSelection('age-10')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold transition-all shadow-xs"
            title="Explain like I am 10"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Like 10</span>
          </button>

          <button
            type="button"
            onClick={() => handleExplainCurrentSelection('analogy')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
            title="Explain using an everyday analogy"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Analogy</span>
          </button>

          <button
            type="button"
            onClick={handleListenSelection}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
            title="Listen to selected text"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Listen</span>
          </button>
        </div>
      )}

      {/* Transcript Segments List */}
      <div
        ref={containerRef}
        onMouseUp={handleMouseUp}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3"
        tabIndex={0}
        role="region"
        aria-label="Transcript text with timestamps"
      >
        {filteredSegments.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500 font-medium">No spoken phrases match &ldquo;{searchQuery}&rdquo;</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="mt-3"
            >
              Show all segments
            </Button>
          </div>
        ) : (
          filteredSegments.map((segment) => {
            const isActive = segment.index === activeSegmentIndex
            return (
              <div
                key={segment.id}
                ref={isActive ? activeItemRef : null}
              >
                <TranscriptSegment
                  segment={segment}
                  isActive={isActive}
                  keyTerms={keyTerms}
                  textSize={textSize}
                  highContrast={highContrast}
                  onSeek={onSeek}
                  onSelectTerm={onSelectTerm}
                />
              </div>
            )
          })
        )}
      </div>

      {/* Accessibility Helper Footer */}
      <div
        className={`px-4 py-2 text-xs border-t ${
          highContrast
            ? 'bg-gray-100 text-black border-black'
            : 'bg-gray-100/80 text-gray-500 border-gray-200'
        }`}
      >
        <span>💡 Click any sentence to jump video. Select any text to ask AI for a simpler explanation.</span>
      </div>
    </section>
  )
}
