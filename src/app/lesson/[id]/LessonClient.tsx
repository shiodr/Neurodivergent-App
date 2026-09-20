'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  BookOpen,
  Sparkles,
  Sliders,
  HelpCircle,
  ArrowLeft,
  Info,
  HeartHandshake,
  MessageSquareHeart,
  Target,
  Zap,
  Play,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { VideoPlayer, type VideoPlayerHandle } from '@/components/video/VideoPlayer'
import { TranscriptPanel } from '@/components/transcript/TranscriptPanel'
import { KeyTermsPanel } from '@/components/keyterms/KeyTermsPanel'
import { SettingsPanel } from '@/components/settings/SettingsPanel'
import { ConversationalCompanion } from '@/components/companion/ConversationalCompanion'
import { PracticeQuizPanel } from '@/components/companion/PracticeQuizPanel'
import { OverwhelmModal } from '@/components/companion/OverwhelmModal'
import { MicroBreakModal } from '@/components/companion/MicroBreakModal'
import { LessonSummaryPrimer } from '@/components/companion/LessonSummaryPrimer'
import { useSettings } from '@/hooks/useSettings'
import { useTranscript } from '@/hooks/useTranscript'
import { useKeyTerms } from '@/hooks/useKeyTerms'
import { formatTime } from '@/lib/utils'
import type { VideoWithRelations, KeyTermData, CALM_THEMES } from '@/types'

interface LessonClientProps {
  video: VideoWithRelations
}

type TabType = 'transcript' | 'chat' | 'keyterms' | 'practice' | 'settings'

export function LessonClient({ video }: LessonClientProps) {
  const {
    settings,
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
  } = useSettings()

  const [currentTime, setCurrentTime] = useState(0)
  const [activeTab, setActiveTab] = useState<TabType>('transcript')
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [showOverwhelmModal, setShowOverwhelmModal] = useState(false)
  const [showBreakModal, setShowBreakModal] = useState(false)
  const [savedResumeTime, setSavedResumeTime] = useState<number | null>(null)

  const videoPlayerRef = useRef<VideoPlayerHandle | null>(null)
  const lastBreakCheckpointRef = useRef<number>(0)
  const lastChapterIndexRef = useRef<number>(-1)

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

  // Check saved progress on load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`nd-progress-${video.id}`)
      if (saved) {
        const time = parseFloat(saved)
        if (time > 10 && time < (video.duration || 1000) - 10) {
          setSavedResumeTime(time)
        }
      }
    } catch {
      // ignore
    }
  }, [video.id, video.duration])

  // Save progress periodically
  useEffect(() => {
    if (currentTime > 5) {
      try {
        localStorage.setItem(`nd-progress-${video.id}`, currentTime.toString())
      } catch {
        // ignore
      }
    }
  }, [currentTime, video.id])

  // Micro-learning break trigger check
  useEffect(() => {
    if (!settings.autoPauseBreaks) return

    // Trigger every ~4 minutes (240s) or at major chapter change
    const currentChapter = video.chapters?.find(
      (c) => currentTime >= c.startTime && currentTime <= c.endTime
    )

    const passedTimeCheckpoint = currentTime - lastBreakCheckpointRef.current > 240
    const changedChapter =
      currentChapter &&
      lastChapterIndexRef.current !== -1 &&
      currentChapter.index !== lastChapterIndexRef.current

    if ((passedTimeCheckpoint || (changedChapter && currentTime > 60)) && currentTime > 30) {
      videoPlayerRef.current?.pause()
      setShowBreakModal(true)
      lastBreakCheckpointRef.current = currentTime
      if (currentChapter) {
        lastChapterIndexRef.current = currentChapter.index
      }
    } else if (currentChapter) {
      lastChapterIndexRef.current = currentChapter.index
    }
  }, [currentTime, settings.autoPauseBreaks, video.chapters])

  const handleSeek = (time: number) => {
    setCurrentTime(time)
    videoPlayerRef.current?.seek(time)
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

  const handleExplainSelection = (
    text: string,
    mode: 'simple' | 'analogy' | 'deep' | 'age-10' = 'simple'
  ) => {
    explainSelectedText(text, video.id, mode)
    setActiveTab('keyterms')
  }

  // Overwhelm handlers
  const handleOpenOverwhelm = () => {
    videoPlayerRef.current?.pause()
    setShowOverwhelmModal(true)
  }

  const handleExplainRecentSimply = () => {
    setActiveTab('chat')
  }

  const handleRecapRecent = () => {
    setActiveTab('chat')
  }

  const handleRewindAndSlow = () => {
    videoPlayerRef.current?.seekRelative(-30)
    updatePlaybackSpeed(0.75)
    videoPlayerRef.current?.play()
  }

  // Calm theme background styling
  const themeBg =
    settings.highContrast
      ? 'bg-white text-black'
      : settings.calmTheme === 'warm-sand'
      ? 'bg-amber-50/70 text-slate-900'
      : settings.calmTheme === 'sage-calm'
      ? 'bg-emerald-50/60 text-slate-900'
      : settings.calmTheme === 'ocean-calm'
      ? 'bg-sky-50/60 text-slate-900'
      : 'bg-slate-50 text-slate-900'

  return (
    <div
      className={`min-h-full space-y-6 transition-colors ${themeBg} ${
        settings.reducedMotion ? 'motion-reduce' : ''
      }`}
    >
      {/* Resume Banner if student visited earlier */}
      {savedResumeTime && (
        <div className="p-3 rounded-2xl bg-blue-100 border border-blue-300 text-blue-950 flex items-center justify-between text-xs font-semibold animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-blue-700" />
            <span>
              Resume where you left off at <strong>{formatTime(savedResumeTime)}</strong>?
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                handleSeek(savedResumeTime)
                setSavedResumeTime(null)
                videoPlayerRef.current?.play()
              }}
              className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs"
            >
              Resume
            </button>
            <button
              type="button"
              onClick={() => setSavedResumeTime(null)}
              className="p-1 text-blue-700 hover:text-blue-900"
              aria-label="Dismiss resume prompt"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation & Header Bar */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b transition-opacity ${
          focusMode ? 'opacity-40 hover:opacity-100' : ''
        } ${settings.highContrast ? 'border-black' : 'border-gray-200'}`}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Back to all lessons"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Lesson Review
              </span>
              {settings.coreConceptsOnly && (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400 text-black">
                  Core Concepts Only
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-2xl font-black tracking-tight line-clamp-1">
              {video.title}
            </h1>
          </div>
        </div>

        {/* Quick Accessibility & Accommodations Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Prominent Overwhelm Button */}
          <button
            type="button"
            onClick={handleOpenOverwhelm}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-xs font-extrabold transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-purple-400 ${
              settings.highContrast
                ? 'bg-yellow-300 text-black border-black'
                : 'bg-purple-100/90 text-purple-900 border-purple-300 hover:bg-purple-200'
            }`}
            aria-label="I feel stuck or overwhelmed"
            title="Get gentle help, a pause, or simpler explanation"
          >
            <HeartHandshake className="w-4 h-4 text-purple-700 shrink-0" />
            <span>I&apos;m Stuck / Overwhelmed</span>
          </button>

          {/* Focus Mode Quick Toggle */}
          <button
            type="button"
            onClick={() => setFocusMode(!focusMode)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              focusMode
                ? 'bg-purple-600 text-white border-purple-500 ring-2 ring-purple-400 font-extrabold'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            aria-pressed={focusMode}
            aria-label="Toggle focus mode spotlight"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Focus Mode</span>
          </button>

          {/* Contrast Toggle */}
          <button
            type="button"
            onClick={toggleHighContrast}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              settings.highContrast
                ? 'bg-yellow-400 text-black border-black ring-2 ring-black font-extrabold'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            aria-label="Toggle high contrast mode"
          >
            <span>Contrast: {settings.highContrast ? 'HIGH' : 'NORMAL'}</span>
          </button>

          {/* Shortcuts Help */}
          <button
            type="button"
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-expanded={showShortcuts}
            aria-label="Toggle keyboard shortcuts reference"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Shortcuts</span>
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Drawer */}
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

      {/* Focus Mode Exit Reminder Banner */}
      {focusMode && (
        <div className="p-3 rounded-2xl bg-purple-900 text-white flex items-center justify-between shadow-lg text-xs sm:text-sm font-semibold animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-300" />
            <span>Focus Mode Active: peripheral controls dimmed for calm focus.</span>
          </div>
          <button
            type="button"
            onClick={() => setFocusMode(false)}
            className="px-3 py-1 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold border border-purple-400"
          >
            Exit Focus Mode
          </button>
        </div>
      )}

      {/* Pre-Lesson Primer (Short Summary + Chapters) */}
      {!focusMode && (
        <LessonSummaryPrimer
          summary={video.summary || video.description}
          chapters={video.chapters}
          highContrast={settings.highContrast}
          onSeekToChapter={handleSeek}
        />
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Video Player & Controls (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-4">
          <VideoPlayer
            ref={videoPlayerRef}
            src={video.filename}
            segments={video.segments}
            chapters={video.chapters}
            captionsEnabled={settings.captionsEnabled}
            playbackSpeed={settings.playbackSpeed}
            coreConceptsOnly={settings.coreConceptsOnly}
            focusMode={focusMode}
            skipSilence={settings.skipSilence}
            onTimeUpdate={setCurrentTime}
            onSeek={setCurrentTime}
            onToggleCoreConcepts={toggleCoreConceptsOnly}
            onToggleFocusMode={() => setFocusMode(!focusMode)}
            activeSegment={activeSegment}
          />

          {/* Settings Panel embedded on desktop for quick access */}
          {!focusMode && (
            <div className="hidden lg:block">
              <SettingsPanel
                settings={settings}
                onUpdateTextSize={updateTextSize}
                onToggleCaptions={toggleCaptions}
                onUpdatePlaybackSpeed={updatePlaybackSpeed}
                onToggleHighContrast={toggleHighContrast}
                onToggleReducedMotion={toggleReducedMotion}
                onUpdateCalmTheme={updateCalmTheme}
                onUpdateAgeGroup={updateAgeGroup}
                onToggleAutoPauseBreaks={toggleAutoPauseBreaks}
                onToggleSkipSilence={toggleSkipSilence}
                onToggleCoreConceptsOnly={toggleCoreConceptsOnly}
                onResetSettings={resetSettings}
              />
            </div>
          )}
        </div>

        {/* Right Column: Tabbed Companion Panel (5 cols on desktop) */}
        <div
          className={`lg:col-span-5 flex flex-col h-[640px] lg:h-[720px] space-y-3 transition-opacity ${
            focusMode ? 'opacity-30 hover:opacity-100' : ''
          }`}
        >
          {/* Tab Selection Buttons (5 accessible tabs) */}
          <div
            className={`grid grid-cols-5 p-1 rounded-2xl border-2 ${
              settings.highContrast
                ? 'bg-black text-white border-black'
                : 'bg-gray-100/90 border-gray-200 text-gray-700'
            }`}
            role="tablist"
            aria-label="Companion Tabs"
          >
            {/* Tab 1: Transcript */}
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'transcript'}
              onClick={() => setActiveTab('transcript')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                activeTab === 'transcript'
                  ? settings.highContrast
                    ? 'bg-yellow-400 text-black font-extrabold shadow'
                    : 'bg-white text-blue-600 shadow-sm'
                  : 'hover:bg-gray-200/60'
              }`}
              title="Interactive Transcript"
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Transcript</span>
            </button>

            {/* Tab 2: AI Chat Companion */}
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'chat'}
              onClick={() => setActiveTab('chat')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                activeTab === 'chat'
                  ? settings.highContrast
                    ? 'bg-yellow-400 text-black font-extrabold shadow'
                    : 'bg-white text-emerald-600 shadow-sm'
                  : 'hover:bg-gray-200/60'
              }`}
              title="AI Lesson Helper Chat"
            >
              <MessageSquareHeart className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              <span className="truncate">AI Chat</span>
            </button>

            {/* Tab 3: Key Terms */}
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'keyterms'}
              onClick={() => setActiveTab('keyterms')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                activeTab === 'keyterms'
                  ? settings.highContrast
                    ? 'bg-yellow-400 text-black font-extrabold shadow'
                    : 'bg-white text-purple-600 shadow-sm'
                  : 'hover:bg-gray-200/60'
              }`}
              title="Key Scientific Terms"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Terms</span>
            </button>

            {/* Tab 4: Practice Quiz */}
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'practice'}
              onClick={() => setActiveTab('practice')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                activeTab === 'practice'
                  ? settings.highContrast
                    ? 'bg-yellow-400 text-black font-extrabold shadow'
                    : 'bg-white text-amber-700 shadow-sm'
                  : 'hover:bg-gray-200/60'
              }`}
              title="Practice Check"
            >
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Quiz</span>
            </button>

            {/* Tab 5: Settings */}
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                activeTab === 'settings'
                  ? settings.highContrast
                    ? 'bg-yellow-400 text-black font-extrabold shadow'
                    : 'bg-white text-gray-900 shadow-sm'
                  : 'hover:bg-gray-200/60'
              }`}
              title="Accessibility Settings"
            >
              <Sliders className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Settings</span>
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

            {activeTab === 'chat' && (
              <ConversationalCompanion
                videoId={video.id}
                currentTime={currentTime}
                ageGroup={settings.ageGroup}
                highContrast={settings.highContrast}
                onAgeGroupChange={updateAgeGroup}
                onSeek={handleSeek}
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
                onExplainMore={handleExplainSelection}
              />
            )}

            {activeTab === 'practice' && (
              <PracticeQuizPanel
                videoId={video.id}
                practiceQuestions={video.practiceQuestions}
                highContrast={settings.highContrast}
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
                  onToggleReducedMotion={toggleReducedMotion}
                  onUpdateCalmTheme={updateCalmTheme}
                  onUpdateAgeGroup={updateAgeGroup}
                  onToggleAutoPauseBreaks={toggleAutoPauseBreaks}
                  onToggleSkipSilence={toggleSkipSilence}
                  onToggleCoreConceptsOnly={toggleCoreConceptsOnly}
                  onResetSettings={resetSettings}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overwhelm Support Modal */}
      <OverwhelmModal
        isOpen={showOverwhelmModal}
        currentTime={currentTime}
        highContrast={settings.highContrast}
        reducedMotion={settings.reducedMotion}
        onClose={() => setShowOverwhelmModal(false)}
        onExplainRecentSimply={handleExplainRecentSimply}
        onRecapRecent={handleRecapRecent}
        onRewindAndSlow={handleRewindAndSlow}
      />

      {/* Micro-learning Break Modal */}
      <MicroBreakModal
        isOpen={showBreakModal}
        currentTime={currentTime}
        currentChapterTitle={
          video.chapters?.find(
            (c) => currentTime >= c.startTime && currentTime <= c.endTime
          )?.title
        }
        highContrast={settings.highContrast}
        reducedMotion={settings.reducedMotion}
        onResume={() => {
          setShowBreakModal(false)
          videoPlayerRef.current?.play()
        }}
        onAskSimpler={() => {
          setShowBreakModal(false)
          setActiveTab('chat')
        }}
        onPracticeCheck={() => {
          setShowBreakModal(false)
          setActiveTab('practice')
        }}
      />
    </div>
  )
}
