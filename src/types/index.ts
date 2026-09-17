export type UserRole = 'ADMIN' | 'TEACHER' | 'LEARNER' | string
export type VideoStatus = 'UPLOADING' | 'PROCESSING' | 'READY' | 'ERROR' | string
export type TextSize = 'small' | 'medium' | 'large' | 'extra-large'
export type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2

export interface VideoWithRelations {
  id: string
  title: string
  description: string | null
  filename: string
  mimetype: string
  duration: number | null
  status: VideoStatus
  uploaderId: string
  createdAt: Date
  updatedAt: Date
  segments: TranscriptSegment[]
  keyTerms: KeyTermData[]
}

export interface TranscriptSegment {
  id: string
  videoId: string
  startTime: number
  endTime: number
  text: string
  index: number
}

export interface KeyTermData {
  id: string
  videoId: string
  term: string
  explanation: string
  segmentRef: number | null
  ageGroup: string
}

export interface UserSettings {
  textSize: TextSize
  captionsEnabled: boolean
  playbackSpeed: PlaybackSpeed
  highContrast: boolean
}

export const DEFAULT_SETTINGS: UserSettings = {
  textSize: 'medium',
  captionsEnabled: true,
  playbackSpeed: 1,
  highContrast: false,
}

export const PLAYBACK_SPEEDS: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

export const TEXT_SIZES: { label: string; value: TextSize; class: string }[] = [
  { label: 'Small', value: 'small', class: 'text-sm' },
  { label: 'Medium', value: 'medium', class: 'text-base' },
  { label: 'Large', value: 'large', class: 'text-lg' },
  { label: 'Extra Large', value: 'extra-large', class: 'text-xl' },
]
