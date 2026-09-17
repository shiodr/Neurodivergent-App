'use client'

import React, { useState, useRef } from 'react'
import {
  BookOpen,
  Sparkles,
  Sliders,
  HelpCircle,
  ArrowLeft,
  Info,
  Maximize2,
} from 'lucide-react'
import Link from 'next/link'
import { VideoPlayer } from '@/components/video/VideoPlayer'
import { TranscriptPanel } from '@/components/transcript/TranscriptPanel'
import { KeyTermsPanel } from '@/components/keyterms/KeyTermsPanel'
import { SettingsPanel } from '@/components/settings/SettingsPanel'
import { useSettings } from '@/hooks/useSettings'
import { useTranscript } from '@/hooks/useTranscript'
import { useKeyTerms } from '@/hooks/useKeyTerms'
import type { VideoWithRelations, KeyTermData } from '@/types'

interface LessonClientProps {
  video: VideoWithRelations
}

export function LessonClient({ video }: LessonClientProps) {
  const {
    settings,
    updateTextSize,
    toggleCaptions,
    updatePlaybackSpeed,
    toggleHighContrast,
  } = useSettings()

  const [currentTime, setCurrentTime] = useState(0)
  const [activeTab, setActiveTab] = useState<'transcript' | 'keyterms' | 'settings'>('transcript')
  const [showShortcuts, setShowShortcuts] = useState(false)

  const seekTargetRef = useRef<((time: number) => void) | null>(null)

  const { activeSegmentIndex, activeSegment } = useTranscript(
    video.segments || [],
    currentTime
  )

  const {
    selectedTerm,
    customExplanation,
    isExplaining,
    explainError,
    selectTerm,
    clearSelection,
    explainSelectedText,
  } = useKeyTerms(video.keyTerms || [])

  const handleSeek = (time: number) => {
    setCurrentTime(time)
    if (seekTargetRef.current) {
      seekTargetRef.current(time)
    }
  }

  const handleJumpToSegment = (segmentIndex: number) => {
    const target = video.segments.find((s) => s.index === segmentIndex)
    if (target) {
      handleSeek(target.startTime)
    }
  }

  const handleSelectTerm = (term: KeyTermData) => {
    selectTerm(term)
    setActiveTab('keyterms')
  }

  const handleExplainSelection = (text: string) => {
    explainSelectedText(text, video.id)
    setActiveTab('keyterms')
  }

  return (
    <div
      className={`space-y-6 transition-colors ${
        settings.highContrast ? 'text-black font-sans' : 'text-gray-900'
      }`}
    >
      {/* Navigation & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Back to all lessons"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Lesson Review
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight line-clamp-1">
              {video.title}
            </h1>
          </div>
        </div>

        {/* Quick Accessibility Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-expanded={showShortcuts}
            aria-label="Toggle keyboard shortcuts reference"
          >
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Shortcuts</span>
          </button>

          <button
            type="button"
            onClick={toggleHighContrast}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              settings.highContrast
                ? 'bg-yellow-400 text-black border-black ring-2 ring-black'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            aria-label="Toggle high contrast mode"
          >
            <span>Contrast: {settings.highContrast ? 'HIGH' : 'NORMAL'}</span>
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Help Drawer */}
      {showShortcuts && (
        <div
          className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-950 text-xs sm:text-sm space-y-2 animate-in fade-in-0 duration-150"
          role="region"
          aria-label="Keyboard Shortcuts"
        >
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600" />
              Keyboard Navigation Shortcuts
            </span>
            <button
              onClick={() => setShowShortcuts(false)}
              className="font-bold underline text-blue-800"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
            <span className="bg-white px-2 py-1 rounded border border-blue-200">Space / K: Play/Pause</span>
            <span className="bg-white px-2 py-1 rounded border border-blue-200">← / → : Seek 5s</span>
            <span className="bg-white px-2 py-1 rounded border border-blue-200">J / L : Seek 10s</span>
            <span className="bg-white px-2 py-1 rounded border border-blue-200">M : Mute/Unmute</span>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Video Player & Context (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-4">
          <VideoPlayer
            src={video.filename}
            segments={video.segments}
            captionsEnabled={settings.captionsEnabled}
            playbackSpeed={settings.playbackSpeed}
            onTimeUpdate={setCurrentTime}
            onSeek={setCurrentTime}
            activeSegment={activeSegment}
          />

          {/* Lesson Overview Description */}
          {video.description && (
            <div
              className={`p-4 rounded-2xl border ${
                settings.highContrast
                  ? 'bg-white border-black text-black'
                  : 'bg-white border-gray-200 text-gray-700'
              }`}
            >
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                Lesson Summary
              </h2>
              <p className="text-sm leading-relaxed font-medium">{video.description}</p>
            </div>
          )}

          {/* Settings Panel embedded on desktop for quick adjustments */}
          <div className="hidden lg:block">
            <SettingsPanel
              settings={settings}
              onUpdateTextSize={updateTextSize}
              onToggleCaptions={toggleCaptions}
              onUpdatePlaybackSpeed={updatePlaybackSpeed}
              onToggleHighContrast={toggleHighContrast}
            />
          </div>
        </div>

        {/* Right Column: Tabbed Companion Panel (5 cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col h-[640px] lg:h-[720px] space-y-3">
          {/* Tab Selection Buttons */}
          <div
            className={`grid grid-cols-3 p-1.5 rounded-2xl border-2 ${
              settings.highContrast
                ? 'bg-black text-white border-black'
                : 'bg-gray-100 border-gray-200 text-gray-700'
            }`}
            role="tablist"
            aria-label="Companion Tabs"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'transcript'}
              onClick={() => setActiveTab('transcript')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                activeTab === 'transcript'
                  ? settings.highContrast
                    ? 'bg-yellow-400 text-black font-extrabold shadow'
                    : 'bg-white text-blue-600 shadow-sm'
                  : 'hover:bg-gray-200/60'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Transcript</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'keyterms'}
              onClick={() => setActiveTab('keyterms')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                activeTab === 'keyterms'
                  ? settings.highContrast
                    ? 'bg-yellow-400 text-black font-extrabold shadow'
                    : 'bg-white text-purple-600 shadow-sm'
                  : 'hover:bg-gray-200/60'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Key Terms</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                activeTab === 'settings'
                  ? settings.highContrast
                    ? 'bg-yellow-400 text-black font-extrabold shadow'
                    : 'bg-white text-gray-900 shadow-sm'
                  : 'hover:bg-gray-200/60'
              }`}
            >
              <Sliders className="w-4 h-4 shrink-0" />
              <span>Settings</span>
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 min-h-0">
            {activeTab === 'transcript' && (
              <TranscriptPanel
                segments={video.segments || []}
                activeSegmentIndex={activeSegmentIndex}
                currentTime={currentTime}
                keyTerms={video.keyTerms || []}
                textSize={settings.textSize}
                highContrast={settings.highContrast}
                onSeek={handleSeek}
                onSelectTerm={handleSelectTerm}
                onExplainSelection={handleExplainSelection}
              />
            )}

            {activeTab === 'keyterms' && (
              <KeyTermsPanel
                keyTerms={video.keyTerms || []}
                selectedTerm={selectedTerm}
                customExplanation={customExplanation}
                isExplaining={isExplaining}
                explainError={explainError}
                highContrast={settings.highContrast}
                onSelectTerm={selectTerm}
                onClearSelection={clearSelection}
                onJumpToSegment={handleJumpToSegment}
              />
            )}

            {activeTab === 'settings' && (
              <div className="overflow-y-auto h-full">
                <SettingsPanel
                  settings={settings}
                  onUpdateTextSize={updateTextSize}
                  onToggleCaptions={toggleCaptions}
                  onUpdatePlaybackSpeed={updatePlaybackSpeed}
                  onToggleHighContrast={toggleHighContrast}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
