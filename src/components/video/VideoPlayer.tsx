'use client'

import React, { useEffect, useState, useRef } from 'react'
import type { TranscriptSegment, PlaybackSpeed, ChapterData } from '@/types'
import { VideoControls } from './VideoControls'
import { CaptionOverlay } from './CaptionOverlay'
import { useVideoPlayer } from '@/hooks/useVideoPlayer'
import { Zap } from 'lucide-react'

interface VideoPlayerProps {
  src: string
  segments: TranscriptSegment[]
  chapters?: ChapterData[]
  captionsEnabled: boolean
  playbackSpeed: PlaybackSpeed
  coreConceptsOnly?: boolean
  focusMode?: boolean
  skipSilence?: boolean
  onTimeUpdate?: (time: number) => void
  onSeek?: (time: number) => void
  onToggleCoreConcepts?: () => void
  onToggleFocusMode?: () => void
  activeSegment: TranscriptSegment | null
}

export interface VideoPlayerHandle {
  seek: (time: number) => void
  pause: () => void
  play: () => void
  replay: () => void
  seekRelative: (delta: number) => void
}

export const VideoPlayer = React.forwardRef<VideoPlayerHandle, VideoPlayerProps>(function VideoPlayer(
  {
    src,
    segments,
    chapters = [],
    captionsEnabled,
    playbackSpeed,
    coreConceptsOnly = false,
    focusMode = false,
    skipSilence = false,
    onTimeUpdate,
    onSeek,
    onToggleCoreConcepts,
    onToggleFocusMode,
    activeSegment,
  },
  ref
) {
  const player = useVideoPlayer()
  const [transitionNotice, setTransitionNotice] = useState<string | null>(null)
  const isJumpingRef = useRef(false)

  React.useImperativeHandle(ref, () => ({
    seek: player.seek,
    pause: player.pause,
    play: player.play,
    replay: player.replay,
    seekRelative: player.seekRelative,
  }))

  // Sync playback speed from settings
  useEffect(() => {
    player.setPlaybackSpeed(playbackSpeed)
  }, [playbackSpeed, player.setPlaybackSpeed])

  // Forward time updates
  useEffect(() => {
    onTimeUpdate?.(player.currentTime)
  }, [player.currentTime, onTimeUpdate])

  // Core Concepts Only playback logic:
  // When active, skip non-core segments automatically
  useEffect(() => {
    if (!coreConceptsOnly || !player.isPlaying || isJumpingRef.current) return

    if (activeSegment && activeSegment.isCore === false) {
      // Find next core segment
      const nextCore = segments.find(
        (s) => s.startTime > player.currentTime && s.isCore !== false
      )

      if (nextCore) {
        isJumpingRef.current = true
        setTransitionNotice(`Next Core Concept: "${nextCore.text.slice(0, 35)}..."`)
        player.seek(nextCore.startTime)
        onSeek?.(nextCore.startTime)

        setTimeout(() => {
          setTransitionNotice(null)
          isJumpingRef.current = false
        }, 2200)
      }
    }
  }, [coreConceptsOnly, player.isPlaying, activeSegment, player, segments, onSeek])

  // Skip Silence logic
  useEffect(() => {
    if (!skipSilence || !player.isPlaying || isJumpingRef.current) return

    // If current time is not within any segment, check if there's a gap
    const inAnySegment = segments.some(
      (s) => player.currentTime >= s.startTime && player.currentTime <= s.endTime
    )

    if (!inAnySegment) {
      const nextSeg = segments.find((s) => s.startTime > player.currentTime)
      if (nextSeg && nextSeg.startTime - player.currentTime > 1.2) {
        player.seek(nextSeg.startTime)
        onSeek?.(nextSeg.startTime)
      }
    }
  }, [skipSilence, player.isPlaying, player.currentTime, segments, player, onSeek])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault()
          player.togglePlay()
          break
        case 'ArrowLeft':
          e.preventDefault()
          player.seekRelative(-5)
          break
        case 'ArrowRight':
          e.preventDefault()
          player.seekRelative(5)
          break
        case 'j':
          e.preventDefault()
          player.seekRelative(-10)
          break
        case 'l':
          e.preventDefault()
          player.seekRelative(10)
          break
        case 'm':
          e.preventDefault()
          player.toggleMute()
          break
        case 'Home':
          e.preventDefault()
          player.seek(0)
          break
        case 'End':
          e.preventDefault()
          player.seek(player.duration)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [player])

  const handleSeek = (time: number) => {
    player.seek(time)
    onSeek?.(time)
  }

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden bg-black shadow-lg transition-all ${
        focusMode ? 'ring-4 ring-purple-500 shadow-2xl' : ''
      }`}
      role="region"
      aria-label="Video player"
    >
      {/* Video element container */}
      <div className="relative aspect-video w-full">
        <video
          ref={player.videoRef}
          src={src}
          className="w-full h-full object-contain"
          preload="metadata"
          playsInline
          aria-label="Lesson video"
        />

        {/* Transition notification banner when skipping non-core segments */}
        {transitionNotice && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-3.5 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-lg z-30 animate-in fade-in slide-in-from-top-2 duration-200">
            <Zap className="w-4 h-4 fill-current" />
            <span>{transitionNotice}</span>
          </div>
        )}

        {/* Core Concepts indicator badge */}
        {coreConceptsOnly && (
          <div className="absolute top-3 left-3 bg-amber-400 text-black font-extrabold text-[11px] px-2 py-0.5 rounded-md shadow flex items-center gap-1 z-20">
            <Zap className="w-3 h-3 fill-current" />
            <span>CORE CONCEPTS ONLY</span>
          </div>
        )}

        {/* Loading overlay */}
        {player.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
              <span className="text-white text-sm">Loading video...</span>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {player.error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
            <div className="text-center p-6 max-w-md">
              <p className="text-white text-lg mb-2">Oops!</p>
              <p className="text-white/80 text-sm">{player.error}</p>
              <button
                onClick={player.replay}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 font-bold"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Click to play/pause */}
        <button
          className="absolute inset-0 w-full h-full cursor-pointer bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset"
          onClick={player.togglePlay}
          aria-label={player.isPlaying ? 'Pause video' : 'Play video'}
          tabIndex={-1}
        />

        {/* Caption overlay */}
        {captionsEnabled && activeSegment && (
          <CaptionOverlay text={activeSegment.text} />
        )}
      </div>

      {/* Controls */}
      <VideoControls
        isPlaying={player.isPlaying}
        currentTime={player.currentTime}
        duration={player.duration}
        volume={player.volume}
        isMuted={player.isMuted}
        playbackSpeed={playbackSpeed}
        chapters={chapters}
        coreConceptsOnly={coreConceptsOnly}
        focusMode={focusMode}
        onTogglePlay={player.togglePlay}
        onSeek={handleSeek}
        onVolumeChange={player.updateVolume}
        onToggleMute={player.toggleMute}
        onReplay={player.replay}
        onToggleCoreConcepts={onToggleCoreConcepts}
        onToggleFocusMode={onToggleFocusMode}
      />
    </div>
  )
})

VideoPlayer.displayName = 'VideoPlayer'
