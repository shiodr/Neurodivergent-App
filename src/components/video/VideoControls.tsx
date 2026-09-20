'use client'

import React, { useState } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Volume1,
  Bookmark,
  Zap,
  Target,
} from 'lucide-react'
import { formatTime } from '@/lib/utils'
import { Slider } from '@/components/ui/slider'
import type { PlaybackSpeed, ChapterData } from '@/types'

interface VideoControlsProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  playbackSpeed: PlaybackSpeed
  chapters?: ChapterData[]
  coreConceptsOnly?: boolean
  focusMode?: boolean
  onTogglePlay: () => void
  onSeek: (time: number) => void
  onVolumeChange: (volume: number) => void
  onToggleMute: () => void
  onReplay: () => void
  onToggleCoreConcepts?: () => void
  onToggleFocusMode?: () => void
}

export function VideoControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  playbackSpeed,
  chapters = [],
  coreConceptsOnly = false,
  focusMode = false,
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onReplay,
  onToggleCoreConcepts,
  onToggleFocusMode,
}: VideoControlsProps) {
  const [hoveredChapter, setHoveredChapter] = useState<ChapterData | null>(null)

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    <div
      className="bg-gray-900 px-3 py-2 sm:px-4 sm:py-3 select-none"
      role="toolbar"
      aria-label="Video controls"
    >
      {/* Progress bar container with Chapter Notches */}
      <div className="relative mb-2 pt-1 pb-1">
        {/* Chapter Hover Preview Tooltip */}
        {hoveredChapter && (
          <div
            style={{
              left: `${Math.min(
                Math.max((hoveredChapter.startTime / (duration || 1)) * 100, 8),
                92
              )}%`,
            }}
            className="absolute -top-7 -translate-x-1/2 bg-black/90 text-white text-[11px] font-semibold px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20 border border-white/20 animate-in fade-in-0 duration-100"
          >
            <span className="text-yellow-400 font-bold mr-1">
              [{formatTime(hoveredChapter.startTime)}]
            </span>
            <span>{hoveredChapter.title}</span>
          </div>
        )}

        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={0.1}
          onValueChange={([value]) => onSeek(value)}
          aria-label="Video progress"
          className="cursor-pointer relative z-10"
        />

        {/* Visual Chapter Markers */}
        {duration > 0 && chapters.length > 0 && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 pointer-events-none flex items-center">
            {chapters.map((ch) => {
              const pct = (ch.startTime / duration) * 100
              if (pct <= 0.5 || pct >= 99.5) return null

              return (
                <button
                  key={ch.id || ch.index}
                  type="button"
                  style={{ left: `${pct}%` }}
                  onMouseEnter={() => setHoveredChapter(ch)}
                  onMouseLeave={() => setHoveredChapter(null)}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSeek(ch.startTime)
                  }}
                  className="absolute w-2 h-3.5 -translate-x-1/2 bg-yellow-400/90 hover:bg-yellow-300 pointer-events-auto rounded-xs shadow-xs transition-transform hover:scale-125 z-10"
                  aria-label={`Jump to chapter: ${ch.title}`}
                  title={`${ch.title} (${formatTime(ch.startTime)})`}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Left: Playback & Volume */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Play/Pause */}
          <button
            onClick={onTogglePlay}
            className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-lg text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>

          {/* Replay */}
          <button
            onClick={onReplay}
            className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-lg text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
            aria-label="Replay from beginning"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Volume */}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleMute}
              className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-lg text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              <VolumeIcon className="h-4 w-4" />
            </button>
            <div className="hidden md:block w-16 lg:w-20">
              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={1}
                step={0.05}
                onValueChange={([value]) => onVolumeChange(value)}
                aria-label="Volume"
              />
            </div>
          </div>

          {/* Time display */}
          <span className="text-white/90 text-xs sm:text-sm font-mono tabular-nums pl-1" aria-live="off">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Right: Accommodations & Modes */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Core Concepts Only Toggle */}
          {onToggleCoreConcepts && (
            <button
              type="button"
              onClick={onToggleCoreConcepts}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                coreConceptsOnly
                  ? 'bg-amber-400 text-black border-amber-300 shadow-sm ring-2 ring-amber-300/60'
                  : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20 hover:text-white'
              }`}
              aria-pressed={coreConceptsOnly}
              aria-label="Toggle Core Concepts Only mode"
              title="Skip non-essential parts and focus on core ideas"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Core Concepts</span>
              {coreConceptsOnly && <span className="text-[10px] ml-0.5 font-extrabold uppercase">ON</span>}
            </button>
          )}

          {/* Focus Mode Toggle */}
          {onToggleFocusMode && (
            <button
              type="button"
              onClick={onToggleFocusMode}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                focusMode
                  ? 'bg-purple-600 text-white border-purple-400 ring-2 ring-purple-300/60'
                  : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20 hover:text-white'
              }`}
              aria-pressed={focusMode}
              aria-label="Toggle Focus Mode"
              title="Spotlight video and active transcript sentence"
            >
              <Target className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Focus</span>
            </button>
          )}

          {/* Speed indicator */}
          <span className="text-white/70 text-xs font-medium px-2 py-1 rounded bg-white/10">
            {playbackSpeed}x
          </span>
        </div>
      </div>
    </div>
  )
}
