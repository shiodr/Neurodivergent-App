'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import type { PlaybackSpeed } from '@/types'

export function useVideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const play = useCallback(() => {
    videoRef.current?.play().catch(() => {
      setError('Could not play video. Please try again.')
    })
  }, [])

  const pause = useCallback(() => {
    videoRef.current?.pause()
  }, [])

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      play()
    } else {
      pause()
    }
  }, [play, pause])

  const seek = useCallback((time: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.max(0, Math.min(time, videoRef.current.duration || 0))
  }, [])

  const seekRelative = useCallback((delta: number) => {
    if (!videoRef.current) return
    seek(videoRef.current.currentTime + delta)
  }, [seek])

  const setPlaybackSpeed = useCallback((speed: PlaybackSpeed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
    }
  }, [])

  const updateVolume = useCallback((v: number) => {
    if (!videoRef.current) return
    const clamped = Math.max(0, Math.min(1, v))
    videoRef.current.volume = clamped
    setVolume(clamped)
    if (clamped > 0 && isMuted) {
      videoRef.current.muted = false
      setIsMuted(false)
    }
  }, [isMuted])

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(videoRef.current.muted)
  }, [])

  const replay = useCallback(() => {
    seek(0)
    play()
  }, [seek, play])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onTimeUpdate = () => setCurrentTime(video.currentTime)
    const onDurationChange = () => setDuration(video.duration)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => setIsPlaying(false)
    const onLoadedData = () => setIsLoading(false)
    const onWaiting = () => setIsLoading(true)
    const onCanPlay = () => setIsLoading(false)
    const onError = () => setError('Video failed to load. Please check the file and try again.')

    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('durationchange', onDurationChange)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('ended', onEnded)
    video.addEventListener('loadeddata', onLoadedData)
    video.addEventListener('waiting', onWaiting)
    video.addEventListener('canplay', onCanPlay)
    video.addEventListener('error', onError)

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('durationchange', onDurationChange)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('loadeddata', onLoadedData)
      video.removeEventListener('waiting', onWaiting)
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('error', onError)
    }
  }, [])

  return {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoading,
    error,
    play,
    pause,
    togglePlay,
    seek,
    seekRelative,
    setPlaybackSpeed,
    updateVolume,
    toggleMute,
    replay,
  }
}
