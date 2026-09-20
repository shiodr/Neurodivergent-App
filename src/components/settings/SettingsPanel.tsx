'use client'

import React from 'react'
import {
  Sliders,
  Type,
  Subtitles,
  Gauge,
  Eye,
  RotateCcw,
  Sparkles,
  Palette,
  Activity,
  Coffee,
  Volume2,
  Zap,
  GraduationCap,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  type UserSettings,
  type TextSize,
  type PlaybackSpeed,
  type AgeGroup,
  type CalmTheme,
  PLAYBACK_SPEEDS,
  TEXT_SIZES,
  CALM_THEMES,
} from '@/types'

interface SettingsPanelProps {
  settings: UserSettings
  onUpdateTextSize: (size: TextSize) => void
  onToggleCaptions: () => void
  onUpdatePlaybackSpeed: (speed: PlaybackSpeed) => void
  onToggleHighContrast: () => void
  onToggleReducedMotion?: () => void
  onUpdateCalmTheme?: (theme: CalmTheme) => void
  onUpdateAgeGroup?: (age: AgeGroup) => void
  onToggleAutoPauseBreaks?: () => void
  onToggleSkipSilence?: () => void
  onToggleCoreConceptsOnly?: () => void
  onResetSettings?: () => void
}

export function SettingsPanel({
  settings,
  onUpdateTextSize,
  onToggleCaptions,
  onUpdatePlaybackSpeed,
  onToggleHighContrast,
  onToggleReducedMotion,
  onUpdateCalmTheme,
  onUpdateAgeGroup,
  onToggleAutoPauseBreaks,
  onToggleSkipSilence,
  onToggleCoreConceptsOnly,
  onResetSettings,
}: SettingsPanelProps) {
  return (
    <div
      className={`p-5 rounded-2xl border-2 shadow-xs space-y-6 ${
        settings.highContrast
          ? 'bg-white border-black text-black'
          : 'bg-white border-gray-200 text-gray-900'
      }`}
      role="region"
      aria-label="Learner Accessibility & Personalization Settings"
    >
      {/* Title */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2.5">
          <Sliders className="w-5 h-5 text-blue-600" />
          <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
            Personalize Learning View
          </h2>
        </div>
        {onResetSettings && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetSettings}
            className="text-xs text-gray-500 hover:text-gray-900 gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </Button>
        )}
      </div>

      {/* 1. Age Level / Complexity */}
      {onUpdateAgeGroup && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            Lesson Explanation Level
          </label>
          <p className="text-xs text-gray-500">
            Adjusts how simply the AI companion explains ideas.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onUpdateAgeGroup('elementary')}
              className={`py-2.5 px-3 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all text-center ${
                settings.ageGroup === 'elementary'
                  ? settings.highContrast
                    ? 'bg-black text-white border-black ring-2 ring-yellow-400'
                    : 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100'
              }`}
            >
              Elementary (Grades 3-5)
            </button>
            <button
              type="button"
              onClick={() => onUpdateAgeGroup('high-school')}
              className={`py-2.5 px-3 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all text-center ${
                settings.ageGroup === 'high-school'
                  ? settings.highContrast
                    ? 'bg-black text-white border-black ring-2 ring-yellow-400'
                    : 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100'
              }`}
            >
              High School (Grades 9-12)
            </button>
          </div>
        </div>
      )}

      {/* 2. Calming Visual Color Themes */}
      {onUpdateCalmTheme && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
            <Palette className="w-4 h-4 text-blue-600" />
            Calming Theme
          </label>
          <p className="text-xs text-gray-500">
            Gentle eye-strain reducing colors to prevent sensory fatigue.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {CALM_THEMES.map((t) => {
              const isSelected = settings.calmTheme === t.value
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => onUpdateCalmTheme(t.value)}
                  className={`py-2 px-3 rounded-xl border-2 font-bold text-xs transition-all text-center flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? settings.highContrast
                        ? 'bg-black text-white border-black ring-2 ring-yellow-400'
                        : 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100'
                  }`}
                  aria-pressed={isSelected}
                >
                  <span
                    className={`w-3 h-3 rounded-full border border-gray-400 shrink-0 ${t.bgClass}`}
                  />
                  <span>{t.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 3. Text Size Controls */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
          <Type className="w-4 h-4 text-blue-600" />
          Transcript & Text Size
        </label>
        <p className="text-xs text-gray-500">
          Make reading easier with comfortable sizing.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {TEXT_SIZES.map((item) => {
            const isSelected = settings.textSize === item.value
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onUpdateTextSize(item.value)}
                className={`py-2 px-3 rounded-xl border-2 font-bold transition-all text-center ${
                  isSelected
                    ? settings.highContrast
                      ? 'bg-black text-white border-black ring-2 ring-yellow-400'
                      : 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100'
                }`}
                aria-pressed={isSelected}
              >
                <span className={item.class}>{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 4. Playback Speed Controls */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
          <Gauge className="w-4 h-4 text-blue-600" />
          Lesson Playback Speed
        </label>
        <p className="text-xs text-gray-500">
          Slow down to absorb details, or speed up when reviewing.
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {PLAYBACK_SPEEDS.map((speed) => {
            const isSelected = settings.playbackSpeed === speed
            return (
              <button
                key={speed}
                type="button"
                onClick={() => onUpdatePlaybackSpeed(speed)}
                className={`flex-1 min-w-[45px] py-1.5 px-2 rounded-lg border-2 font-bold text-xs sm:text-sm transition-all text-center ${
                  isSelected
                    ? settings.highContrast
                      ? 'bg-black text-white border-black ring-2 ring-yellow-400'
                      : 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100'
                }`}
                aria-pressed={isSelected}
              >
                {speed}x
              </button>
            )
          })}
        </div>
      </div>

      {/* 5. Sensory & Learning Support Toggles */}
      <div className="space-y-3 pt-2 border-t">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Sensory & Accessibility Supports
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Captions Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
            <div className="space-y-0.5 pr-2">
              <label
                htmlFor="toggle-captions"
                className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-800 cursor-pointer"
              >
                <Subtitles className="w-4 h-4 text-blue-600" />
                Video Captions
              </label>
              <p className="text-[11px] text-gray-500">
                Show subtitles on video.
              </p>
            </div>
            <Switch
              id="toggle-captions"
              checked={settings.captionsEnabled}
              onCheckedChange={onToggleCaptions}
            />
          </div>

          {/* High Contrast Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
            <div className="space-y-0.5 pr-2">
              <label
                htmlFor="toggle-contrast"
                className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-800 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-blue-600" />
                High Contrast
              </label>
              <p className="text-[11px] text-gray-500">
                Maximum sharpness.
              </p>
            </div>
            <Switch
              id="toggle-contrast"
              checked={settings.highContrast}
              onCheckedChange={onToggleHighContrast}
            />
          </div>

          {/* Reduced Motion Toggle */}
          {onToggleReducedMotion && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
              <div className="space-y-0.5 pr-2">
                <label
                  htmlFor="toggle-reduced-motion"
                  className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-800 cursor-pointer"
                >
                  <Activity className="w-4 h-4 text-blue-600" />
                  Reduced Motion
                </label>
                <p className="text-[11px] text-gray-500">
                  Stops animations & pulses.
                </p>
              </div>
              <Switch
                id="toggle-reduced-motion"
                checked={settings.reducedMotion}
                onCheckedChange={onToggleReducedMotion}
              />
            </div>
          )}

          {/* Micro-learning Breaks Toggle */}
          {onToggleAutoPauseBreaks && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
              <div className="space-y-0.5 pr-2">
                <label
                  htmlFor="toggle-breaks"
                  className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-800 cursor-pointer"
                >
                  <Coffee className="w-4 h-4 text-blue-600" />
                  Gentle Break Pauses
                </label>
                <p className="text-[11px] text-gray-500">
                  Optional pause every few mins.
                </p>
              </div>
              <Switch
                id="toggle-breaks"
                checked={settings.autoPauseBreaks}
                onCheckedChange={onToggleAutoPauseBreaks}
              />
            </div>
          )}

          {/* Skip Silence / Filler Toggle */}
          {onToggleSkipSilence && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
              <div className="space-y-0.5 pr-2">
                <label
                  htmlFor="toggle-silence"
                  className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-800 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-blue-600" />
                  Skip Long Silences
                </label>
                <p className="text-[11px] text-gray-500">
                  Smoothly bypass pause gaps.
                </p>
              </div>
              <Switch
                id="toggle-silence"
                checked={settings.skipSilence}
                onCheckedChange={onToggleSkipSilence}
              />
            </div>
          )}

          {/* Core Concepts Only Toggle */}
          {onToggleCoreConceptsOnly && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
              <div className="space-y-0.5 pr-2">
                <label
                  htmlFor="toggle-core-concepts"
                  className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-800 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-500" />
                  Core Concepts Only
                </label>
                <p className="text-[11px] text-gray-500">
                  Play essential parts only.
                </p>
              </div>
              <Switch
                id="toggle-core-concepts"
                checked={settings.coreConceptsOnly}
                onCheckedChange={onToggleCoreConceptsOnly}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
