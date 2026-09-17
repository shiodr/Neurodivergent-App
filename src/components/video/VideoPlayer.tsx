'use client'

import React, { useEffect } from 'react'
import type { TranscriptSegment, PlaybackSpeed } from '@/types'
import { VideoControls } from './VideoControls'
import { CaptionOverlay } from './CaptionOverlay'
import { useVideoPlayer } from '@/hooks/useVideoPlayer'

interface VideoPlayerProps {
  src: string
  segments: TranscriptSegment[]
  captionsEnabled: boolean
  playbackSpeed: PlaybackSpeed
  onTimeUpdate?: (time: number) => void
  onSeek?: (time: number) => void
  activeSegment: TranscriptSegment | null
}

export function VideoPlayer({
  src,
  segments,
  captionsEnabled,
  playbackSpeed,
  onTimeUpdate,
  onSeek,
  activeSegment,
}: VideoPlayerProps) {
  const player = useVideoPlayer()

  // Sync playback speed from settings
  useEffect(() => {
    player.setPlaybackSpeed(playbackSpeed)
  }, [playbackSpeed, player.setPlaybackSpeed])

  // Forward time updates
  useEffect(() => {
    onTimeUpdate?.(player.currentTime)
  }, [player.currentTime, onTimeUpdate])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle when not in an input field
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
      className="relative w-full rounded-xl overflow-hidden bg-black shadow-lg"
      role="region"
      aria-label="Video player"
    >
      {/* Video element */}
      <div className="relative aspect-video w-full">
        <video
          ref={player.videoRef}
          src={src}
          className="w-full h-full object-contain"
          preload="metadata"
          playsInline
          aria-label="Lesson video"
        />

        {/* Loading overlay */}
        {player.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
              <span className="text-white text-sm">Loading video...</span>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {player.error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center p-6 max-w-md">
              <p className="text-white text-lg mb-2">Oops!</p>
              <p className="text-white/80 text-sm">{player.error}</p>
              <button
                onClick={player.replay}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
        onTogglePlay={player.togglePlay}
        onSeek={handleSeek}
        onVolumeChange={player.updateVolume}
        onToggleMute={player.toggleMute}
        onReplay={player.replay}
      />
    </div>
  )
}
