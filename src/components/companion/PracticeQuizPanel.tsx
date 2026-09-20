'use client'

import React, { useState, useEffect } from 'react'
import {
  HelpCircle,
  Eye,
  EyeOff,
  Sparkles,
  PlayCircle,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { speakText, stopSpeech, isCurrentlySpeaking } from '@/lib/tts'
import { AI_DISCLAIMER_TEXT } from '@/lib/prompts'
import type { PracticeQuestionData } from '@/types'

interface PracticeQuizPanelProps {
  videoId: string
  practiceQuestions?: PracticeQuestionData[]
  highContrast: boolean
  onJumpToSegment?: (segmentIndex: number) => void
}

export function PracticeQuizPanel({
  videoId,
  practiceQuestions = [],
  highContrast,
  onJumpToSegment,
}: PracticeQuizPanelProps) {
  const [questions, setQuestions] = useState<PracticeQuestionData[]>(practiceQuestions)
  const [loading, setLoading] = useState(practiceQuestions.length === 0)
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({})
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({})
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({})
  const [speakingId, setSpeakingId] = useState<string | null>(null)

  useEffect(() => {
    if (practiceQuestions.length > 0) {
      setQuestions(practiceQuestions)
      setLoading(false)
      return
    }

    // Fetch from API
    fetch(`/api/companion/practice?videoId=${videoId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.questions) {
          setQuestions(data.questions)
        }
      })
      .catch((err) => console.error('Failed to fetch practice questions:', err))
      .finally(() => setLoading(false))
  }, [videoId, practiceQuestions])

  const toggleRevealAnswer = (id: string) => {
    setRevealedAnswers((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleRevealHint = (id: string) => {
    setRevealedHints((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleSelectChoice = (questionId: string, choice: string) => {
    setSelectedChoices((prev) => ({ ...prev, [questionId]: choice }))
  }

  const handleToggleSpeak = (questionId: string, text: string) => {
    if (speakingId === questionId && isCurrentlySpeaking()) {
      stopSpeech()
      setSpeakingId(null)
    } else {
      stopSpeech()
      setSpeakingId(questionId)
      speakText(text, () => {
        setSpeakingId(null)
      })
    }
  }

  return (
    <section
      className={`flex flex-col h-full rounded-2xl border-2 overflow-hidden shadow-sm ${
        highContrast ? 'bg-white border-black' : 'bg-gray-50/50 border-gray-200'
      }`}
      aria-label="Practice Check and Concept Review Questions"
    >
      {/* Header */}
      <div
        className={`p-4 border-b-2 flex items-center justify-between ${
          highContrast ? 'bg-black text-white border-black' : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
            <HelpCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
              Practice Check
            </h2>
            <span className="text-[11px] text-gray-500 font-medium">
              Low-stress understanding checks
            </span>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 font-bold">
          {questions.length} questions
        </span>
      </div>

      {/* Safety Notice */}
      <div
        className={`px-3.5 py-2 text-[11px] border-b ${
          highContrast
            ? 'bg-amber-100 text-black border-black font-semibold'
            : 'bg-amber-50 text-amber-900 border-amber-200'
        }`}
      >
        <span>💡 Answers are hidden by default so you can think first without stress.</span>
      </div>

      {/* Questions List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" tabIndex={0}>
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <p className="text-xs text-gray-500 font-bold">Loading gentle practice questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm font-medium">
            No practice questions generated yet for this lesson.
          </div>
        ) : (
          questions.map((q, idx) => {
            const isAnswerRevealed = !!revealedAnswers[q.id]
            const isHintRevealed = !!revealedHints[q.id]
            const isSpeakingThis = speakingId === q.id
            const parsedOptions: string[] = Array.isArray(q.options)
              ? q.options
              : typeof q.options === 'string'
              ? JSON.parse(q.options)
              : []
            const userChoice = selectedChoices[q.id]

            return (
              <div
                key={q.id || idx}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all space-y-3.5 ${
                  highContrast
                    ? 'bg-white border-black text-black'
                    : 'bg-white border-gray-200/90 text-slate-900 shadow-xs'
                }`}
              >
                {/* Question Header & TTS */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                      Q{idx + 1}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold leading-snug">
                      {q.question}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleToggleSpeak(
                        q.id,
                        `${q.question}. ${
                          parsedOptions.length > 0 ? 'Options: ' + parsedOptions.join(', ') : ''
                        }`
                      )
                    }
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                    aria-label={isSpeakingThis ? 'Stop question audio' : 'Listen to question'}
                  >
                    {isSpeakingThis ? (
                      <VolumeX className="w-4 h-4 text-emerald-600 animate-pulse" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Multiple Choice Options */}
                {parsedOptions.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {parsedOptions.map((opt, optIdx) => {
                      const isSelected = userChoice === opt
                      const isCorrect = isAnswerRevealed && opt.trim() === q.answer.trim()

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectChoice(q.id, opt)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                            isCorrect
                              ? 'bg-emerald-100 text-emerald-950 border-emerald-400 font-bold'
                              : isSelected
                              ? highContrast
                                ? 'bg-black text-white border-black font-bold'
                                : 'bg-blue-100/70 text-blue-950 border-blue-300 font-bold'
                              : highContrast
                              ? 'bg-white text-black border-gray-400 hover:border-black'
                              : 'bg-gray-50/70 text-gray-800 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <span>{opt}</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Hint Bar */}
                {q.hint && (
                  <div className="pt-1">
                    {isHintRevealed ? (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Hint:</strong> {q.hint}
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleRevealHint(q.id)}
                        className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline inline-flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Need a hint?</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Hidden Answer / Solution Card */}
                {isAnswerRevealed && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 text-xs sm:text-sm space-y-1 animate-in fade-in-50 duration-150">
                    <div className="flex items-center gap-1.5 font-extrabold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Correct Answer: {q.answer}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons: Reveal Answer & Jump to Segment */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => toggleRevealAnswer(q.id)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      isAnswerRevealed
                        ? 'bg-gray-100 text-gray-700 border-gray-300'
                        : highContrast
                        ? 'bg-white text-black border-black hover:bg-yellow-300'
                        : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    {isAnswerRevealed ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide Answer</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Reveal Answer</span>
                      </>
                    )}
                  </button>

                  {q.segmentRef !== null && q.segmentRef !== undefined && (
                    <button
                      type="button"
                      onClick={() => onJumpToSegment?.(q.segmentRef!)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-blue-600 p-1"
                    >
                      <PlayCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span>Review in Video</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
