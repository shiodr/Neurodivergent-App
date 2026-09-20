export type UserRole = 'ADMIN' | 'TEACHER' | 'LEARNER' | string
export type VideoStatus = 'UPLOADING' | 'PROCESSING' | 'READY' | 'ERROR' | string
export type TextSize = 'small' | 'medium' | 'large' | 'extra-large'
export type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2
export type AgeGroup = 'elementary' | 'high-school'
export type CalmTheme = 'default' | 'warm-sand' | 'sage-calm' | 'ocean-calm' | 'high-contrast'

export interface VideoWithRelations {
  id: string
  title: string
  description: string | null
  summary?: string | null
  filename: string
  mimetype: string
  duration: number | null
  status: VideoStatus
  uploaderId: string
  createdAt: Date
  updatedAt: Date
  segments: TranscriptSegment[]
  keyTerms: KeyTermData[]
  chapters?: ChapterData[]
  practiceQuestions?: PracticeQuestionData[]
}

export interface TranscriptSegment {
  id: string
  videoId: string
  startTime: number
  endTime: number
  text: string
  index: number
  isCore?: boolean
}

export interface KeyTermData {
  id: string
  videoId: string
  term: string
  explanation: string
  segmentRef: number | null
  ageGroup: string
}

export interface ChapterData {
  id: string
  videoId: string
  title: string
  startTime: number
  endTime: number
  index: number
}

export interface PracticeQuestionData {
  id: string
  videoId: string
  question: string
  answer: string
  hint?: string | null
  options?: string | null
  segmentRef?: number | null
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  suggestedActions?: string[]
}

export interface UserSettings {
  textSize: TextSize
  captionsEnabled: boolean
  playbackSpeed: PlaybackSpeed
  highContrast: boolean
  reducedMotion: boolean
  calmTheme: CalmTheme
  ageGroup: AgeGroup
  autoPauseBreaks: boolean
  skipSilence: boolean
  coreConceptsOnly: boolean
}

export const DEFAULT_SETTINGS: UserSettings = {
  textSize: 'medium',
  captionsEnabled: true,
  playbackSpeed: 1,
  highContrast: false,
  reducedMotion: false,
  calmTheme: 'default',
  ageGroup: 'elementary',
  autoPauseBreaks: true,
  skipSilence: false,
  coreConceptsOnly: false,
}

export const PLAYBACK_SPEEDS: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

export const TEXT_SIZES: { label: string; value: TextSize; class: string }[] = [
  { label: 'Small', value: 'small', class: 'text-sm' },
  { label: 'Medium', value: 'medium', class: 'text-base' },
  { label: 'Large', value: 'large', class: 'text-lg' },
  { label: 'Extra Large', value: 'extra-large', class: 'text-xl' },
]

export const CALM_THEMES: { label: string; value: CalmTheme; bgClass: string; borderClass: string }[] = [
  { label: 'Default Slate', value: 'default', bgClass: 'bg-slate-50', borderClass: 'border-slate-200' },
  { label: 'Warm Sand', value: 'warm-sand', bgClass: 'bg-amber-50/70', borderClass: 'border-amber-200' },
  { label: 'Sage Calm', value: 'sage-calm', bgClass: 'bg-emerald-50/60', borderClass: 'border-emerald-200' },
  { label: 'Ocean Calm', value: 'ocean-calm', bgClass: 'bg-sky-50/60', borderClass: 'border-sky-200' },
  { label: 'High Contrast', value: 'high-contrast', bgClass: 'bg-white', borderClass: 'border-black' },
]
