'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  type UserSettings,
  type TextSize,
  type PlaybackSpeed,
  type AgeGroup,
  type CalmTheme,
  DEFAULT_SETTINGS,
} from '@/types'

const STORAGE_KEY = 'nd-app-settings'

function loadSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
    }
  } catch {
    // ignore parse errors
  }
  return DEFAULT_SETTINGS
}

function saveSettings(settings: UserSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // ignore storage errors
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setSettings(loadSettings())
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) {
      saveSettings(settings)
    }
  }, [settings, loaded])

  const updateTextSize = useCallback((textSize: TextSize) => {
    setSettings((prev) => ({ ...prev, textSize }))
  }, [])

  const toggleCaptions = useCallback(() => {
    setSettings((prev) => ({ ...prev, captionsEnabled: !prev.captionsEnabled }))
  }, [])

  const updatePlaybackSpeed = useCallback((playbackSpeed: PlaybackSpeed) => {
    setSettings((prev) => ({ ...prev, playbackSpeed }))
  }, [])

  const toggleHighContrast = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      highContrast: !prev.highContrast,
      calmTheme: !prev.highContrast ? 'high-contrast' : 'default',
    }))
  }, [])

  const toggleReducedMotion = useCallback(() => {
    setSettings((prev) => ({ ...prev, reducedMotion: !prev.reducedMotion }))
  }, [])

  const updateCalmTheme = useCallback((calmTheme: CalmTheme) => {
    setSettings((prev) => ({
      ...prev,
      calmTheme,
      highContrast: calmTheme === 'high-contrast',
    }))
  }, [])

  const updateAgeGroup = useCallback((ageGroup: AgeGroup) => {
    setSettings((prev) => ({ ...prev, ageGroup }))
  }, [])

  const toggleAutoPauseBreaks = useCallback(() => {
    setSettings((prev) => ({ ...prev, autoPauseBreaks: !prev.autoPauseBreaks }))
  }, [])

  const toggleSkipSilence = useCallback(() => {
    setSettings((prev) => ({ ...prev, skipSilence: !prev.skipSilence }))
  }, [])

  const toggleCoreConceptsOnly = useCallback(() => {
    setSettings((prev) => ({ ...prev, coreConceptsOnly: !prev.coreConceptsOnly }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  return {
    settings,
    loaded,
    updateTextSize,
    toggleCaptions,
    updatePlaybackSpeed,
    toggleHighContrast,
    toggleReducedMotion,
    updateCalmTheme,
    updateAgeGroup,
    toggleAutoPauseBreaks,
    toggleSkipSilence,
    toggleCoreConceptsOnly,
    resetSettings,
  }
}
