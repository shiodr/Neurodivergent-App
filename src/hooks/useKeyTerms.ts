'use client'

import { useState, useCallback } from 'react'
import type { KeyTermData } from '@/types'

export function useKeyTerms(keyTerms: KeyTermData[]) {
  const [selectedTerm, setSelectedTerm] = useState<KeyTermData | null>(null)
  const [customExplanation, setCustomExplanation] = useState<string | null>(null)
  const [isExplaining, setIsExplaining] = useState(false)
  const [explainError, setExplainError] = useState<string | null>(null)

  const selectTerm = useCallback((term: KeyTermData) => {
    setSelectedTerm(term)
    setCustomExplanation(null)
    setExplainError(null)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedTerm(null)
    setCustomExplanation(null)
    setExplainError(null)
  }, [])

  const explainSelectedText = useCallback(
    async (
      text: string,
      videoId: string,
      mode: 'simple' | 'analogy' | 'deep' | 'age-10' = 'simple'
    ) => {
      if (!text.trim()) return
      setIsExplaining(true)
      setExplainError(null)
      setCustomExplanation(null)

      try {
        const response = await fetch('/api/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text.trim(), videoId, mode }),
        })

        if (!response.ok) {
          throw new Error('Could not get explanation. Please try again.')
        }

        const data = await response.json()
        setCustomExplanation(data.explanation)
      } catch (err) {
      setExplainError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      )
    } finally {
      setIsExplaining(false)
    }
  }, [])

  return {
    keyTerms,
    selectedTerm,
    customExplanation,
    isExplaining,
    explainError,
    selectTerm,
    clearSelection,
    explainSelectedText,
  }
}
