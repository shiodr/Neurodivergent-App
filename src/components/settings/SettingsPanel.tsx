'use client'

import React from 'react'
import {
  Sliders,
  Type,
  Subtitles,
  Gauge,
  Eye,
  RotateCcw,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  type UserSettings,
  type TextSize,
  type PlaybackSpeed,
  PLAYBACK_SPEEDS,
  TEXT_SIZES,
  DEFAULT_SETTINGS,
} from '@/types'

interface SettingsPanelProps {
  settings: UserSettings
  onUpdateTextSize: (size: TextSize) => void
  onToggleCaptions: () => void
  onUpdatePlaybackSpeed: (speed: PlaybackSpeed) => void
  onToggleHighContrast: () => void
  onResetSettings?: () => void
}

export function SettingsPanel({
  settings,
  onUpdateTextSize,
  onToggleCaptions,
  onUpdatePlaybackSpeed,
  onToggleHighContrast,
  onResetSettings,
}: SettingsPanelProps) {
  return (
    <div
      className={`p-5 rounded-2xl border-2 shadow-sm space-y-6 ${
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
          <h2 className="text-lg font-extrabold tracking-tight">
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

      {/* 1. Text Size Controls */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
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
                className={`py-2.5 px-3 rounded-xl border-2 font-bold transition-all text-center focus:outline-none focus:ring-3 focus:ring-blue-400 ${
                  isSelected
                    ? settings.highContrast
                      ? 'bg-black text-white border-black ring-2 ring-yellow-400'
                      : 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                }`}
                aria-pressed={isSelected}
              >
                <span className={item.class}>{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Playback Speed Controls */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
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
                className={`flex-1 min-w-[50px] py-2 px-2.5 rounded-lg border-2 font-bold text-sm transition-all text-center focus:outline-none focus:ring-3 focus:ring-blue-400 ${
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

      {/* 3. Captions & Visual Contrast Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
        {/* Caption Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border-2 border-gray-200">
          <div className="space-y-0.5 pr-2">
            <label
              htmlFor="toggle-captions"
              className="flex items-center gap-2 text-sm font-bold text-gray-800 cursor-pointer"
            >
              <Subtitles className="w-4 h-4 text-blue-600" />
              Video Captions
            </label>
            <p className="text-xs text-gray-500">
              Show subtitles right on video screen.
            </p>
          </div>
          <Switch
            id="toggle-captions"
            checked={settings.captionsEnabled}
            onCheckedChange={onToggleCaptions}
            aria-label="Toggle video captions overlay"
          />
        </div>

        {/* High Contrast Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border-2 border-gray-200">
          <div className="space-y-0.5 pr-2">
            <label
              htmlFor="toggle-contrast"
              className="flex items-center gap-2 text-sm font-bold text-gray-800 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-blue-600" />
              High Contrast
            </label>
            <p className="text-xs text-gray-500">
              Sharper borders & high readability.
            </p>
          </div>
          <Switch
            id="toggle-contrast"
            checked={settings.highContrast}
            onCheckedChange={onToggleHighContrast}
            aria-label="Toggle high contrast display"
          />
        </div>
      </div>
    </div>
  )
}
