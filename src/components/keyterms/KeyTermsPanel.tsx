'use client'

import React from 'react'
import {
  Sparkles,
  PlayCircle,
  AlertTriangle,
  Lightbulb,
  X,
  Loader2,
  BookmarkCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { KeyTermData } from '@/types'

interface KeyTermsPanelProps {
  keyTerms: KeyTermData[]
  selectedTerm: KeyTermData | null
  customExplanation: string | null
  isExplaining: boolean
  explainError: string | null
  highContrast: boolean
  onSelectTerm: (term: KeyTermData) => void
  onClearSelection: () => void
  onJumpToSegment?: (segmentIndex: number) => void
}

export function KeyTermsPanel({
  keyTerms,
  selectedTerm,
  customExplanation,
  isExplaining,
  explainError,
  highContrast,
  onSelectTerm,
  onClearSelection,
  onJumpToSegment,
}: KeyTermsPanelProps) {
  return (
    <section
      className={`flex flex-col h-full rounded-2xl border-2 overflow-hidden shadow-sm ${
        highContrast ? 'bg-white border-black' : 'bg-white border-gray-200'
      }`}
      aria-label="AI Key Terms and Explanations"
    >
      {/* Panel Header */}
      <div
        className={`p-4 border-b-2 flex items-center justify-between ${
          highContrast ? 'bg-black text-white border-black' : 'bg-purple-50/70 border-purple-100'
        }`}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-bold tracking-tight">Key Concepts & AI Helper</h2>
        </div>
        <Badge variant="accent" className="font-bold">
          {keyTerms.length} terms detected
        </Badge>
      </div>

      {/* Required Safety Disclaimer (prominent & reassuring) */}
      <div
        className={`px-4 py-3 flex items-start gap-2.5 text-xs border-b ${
          highContrast
            ? 'bg-amber-100 text-black border-black'
            : 'bg-amber-50 text-amber-900 border-amber-200'
        }`}
        role="note"
      >
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-snug">
          <strong className="font-bold">AI Notice:</strong> Explanations are supplementary helper notes simplified for learning. They may contain small inaccuracies. Always verify with your teacher or the original lesson video.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" tabIndex={0}>
        {/* On-demand Explanation Loading State */}
        {isExplaining && (
          <div className="p-4 rounded-xl bg-purple-50 border-2 border-purple-300 text-purple-900 flex items-center gap-3 animate-pulse">
            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            <div>
              <p className="font-bold text-sm">Asking AI Helper...</p>
              <p className="text-xs text-purple-700">Writing a clear, simple explanation based on your lesson.</p>
            </div>
          </div>
        )}

        {/* On-demand Explanation Error State */}
        {explainError && (
          <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-900">
            <p className="font-bold text-sm">Could not generate explanation</p>
            <p className="text-xs mt-1">{explainError}</p>
          </div>
        )}

        {/* On-demand Custom Explanation Display */}
        {customExplanation && !isExplaining && (
          <div className="p-4 rounded-xl bg-purple-100/80 border-2 border-purple-400 text-purple-950 relative shadow-sm">
            <button
              onClick={onClearSelection}
              className="absolute top-3 right-3 p-1 rounded-md text-purple-700 hover:bg-purple-200"
              aria-label="Dismiss custom explanation"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-purple-700" />
              <h3 className="font-bold text-sm uppercase tracking-wide text-purple-900">
                Custom Selection Explained
              </h3>
            </div>
            <p className="text-sm sm:text-base leading-relaxed font-medium">
              {customExplanation}
            </p>
          </div>
        )}

        {/* Selected Term Detail Card */}
        {selectedTerm && (
          <div
            className={`p-4 sm:p-5 rounded-xl border-2 relative transition-all ${
              highContrast
                ? 'bg-yellow-50 border-black text-black'
                : 'bg-blue-50 border-blue-400 text-blue-950'
            }`}
          >
            <button
              onClick={onClearSelection}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-blue-200/60 text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close term explanation"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <BookmarkCheck className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-extrabold">{selectedTerm.term}</h3>
            </div>

            <p className="text-sm sm:text-base leading-relaxed text-gray-900 font-medium mb-4">
              {selectedTerm.explanation}
            </p>

            {selectedTerm.segmentRef !== null && selectedTerm.segmentRef !== undefined && (
              <Button
                size="sm"
                variant="default"
                onClick={() => onJumpToSegment?.(selectedTerm.segmentRef!)}
                className="font-bold text-xs gap-1.5"
              >
                <PlayCircle className="w-4 h-4" />
                Jump to Lesson Explanation
              </Button>
            )}
          </div>
        )}

        {/* List of Detected Key Terms */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
            Select a term for a quick definition:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {keyTerms.map((item) => {
              const isSelected = selectedTerm?.id === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTerm(item)}
                  className={`p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between gap-2 focus:outline-none focus:ring-3 focus:ring-blue-400 ${
                    isSelected
                      ? highContrast
                        ? 'bg-black text-white border-black font-bold'
                        : 'bg-blue-600 text-white border-blue-600 font-bold shadow'
                      : highContrast
                      ? 'bg-white text-black border-gray-400 hover:border-black'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200 hover:border-gray-300'
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`Learn about ${item.term}`}
                >
                  <span className="font-semibold text-sm">{item.term}</span>
                  <Lightbulb
                    className={`w-4 h-4 shrink-0 ${
                      isSelected ? 'text-yellow-300' : 'text-gray-400'
                    }`}
                  />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
