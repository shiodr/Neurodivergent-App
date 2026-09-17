'use client'

import { useState, useMemo, useCallback } from 'react'
import type { TranscriptSegment } from '@/types'

export function useTranscript(segments: TranscriptSegment[], currentTime: number) {
  const [searchQuery, setSearchQuery] = useState('')

  const activeSegmentIndex = useMemo(() => {
    if (segments.length === 0) return -1
    for (let i = segments.length - 1; i >= 0; i--) {
      if (currentTime >= segments[i].startTime && currentTime < segments[i].endTime) {
        return i
      }
    }
    // If between segments, find closest upcoming
    for (let i = 0; i < segments.length; i++) {
      if (currentTime < segments[i].startTime) {
        return Math.max(0, i - 1)
      }
    }
    return segments.length - 1
  }, [segments, currentTime])

  const activeSegment = useMemo(() => {
    if (activeSegmentIndex >= 0 && activeSegmentIndex < segments.length) {
      return segments[activeSegmentIndex]
    }
    return null
  }, [segments, activeSegmentIndex])

  const filteredSegments = useMemo(() => {
    if (!searchQuery.trim()) return segments
    const query = searchQuery.toLowerCase()
    return segments.filter(segment =>
      segment.text.toLowerCase().includes(query)
    )
  }, [segments, searchQuery])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
  }, [])

  return {
    searchQuery,
    setSearchQuery,
    clearSearch,
    activeSegmentIndex,
    activeSegment,
    filteredSegments,
  }
}
