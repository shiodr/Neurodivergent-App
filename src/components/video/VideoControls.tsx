'use client'

import React from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Volume1,
} from 'lucide-react'
import { formatTime } from '@/lib/utils'
import { Slider } from '@/components/ui/slider'
import type { PlaybackSpeed } from '@/types'

interface VideoControlsProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  playbackSpeed: PlaybackSpeed
  onTogglePlay: () => void
  onSeek: (time: number) => void
  onVolumeChange: (volume: number) => void
  onToggleMute: () => void
  onReplay: () => void
}

export function VideoControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  playbackSpeed,
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onReplay,
}: VideoControlsProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    <div
      className="bg-gray-900 px-3 py-2 sm:px-4 sm:py-3"
      role="toolbar"
      aria-label="Video controls"
    >
      {/* Progress bar */}
      <div className="mb-2">
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={0.1}
          onValueChange={([value]) => onSeek(value)}
          aria-label="Video progress"
          className="cursor-pointer"
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Play/Pause */}
        <button
          onClick={onTogglePlay}
          className="flex items-center justify-center h-10 w-10 rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>

        {/* Replay */}
        <button
          onClick={onReplay}
          className="flex items-center justify-center h-10 w-10 rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
          aria-label="Replay from beginning"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        {/* Volume */}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleMute}
            className="flex items-center justify-center h-10 w-10 rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            <VolumeIcon className="h-4 w-4" />
          </button>
          <div className="hidden sm:block w-20">
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
        <div className="flex-1 text-center">
          <span className="text-white/90 text-sm font-mono tabular-nums" aria-live="off">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Speed indicator */}
        <span className="text-white/70 text-xs font-medium px-2 py-1 rounded bg-white/10">
          {playbackSpeed}x
        </span>
      </div>
    </div>
  )
}
