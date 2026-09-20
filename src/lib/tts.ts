// Client-side accessible Text-To-Speech (TTS) using Web Speech API
// Zero latency, zero cost, completely private and accessible for neurodivergent learners.

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

let activeUtterance: SpeechSynthesisUtterance | null = null

export function speakText(
  text: string,
  onEnd?: () => void,
  rate: number = 0.95
): boolean {
  if (!isSpeechSynthesisSupported()) {
    console.warn('SpeechSynthesis is not supported in this browser.')
    return false
  }

  stopSpeech()

  // Clean markdown syntax or symbols for clearer spoken audio
  const cleanText = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[•#_]/g, '')
    .trim()

  if (!cleanText) return false

  const utterance = new SpeechSynthesisUtterance(cleanText)
  utterance.rate = rate
  utterance.pitch = 1.0

  // Attempt to select a clear, natural English voice
  const voices = window.speechSynthesis.getVoices()
  const preferredVoice =
    voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google'))) ||
    voices.find((v) => v.lang.startsWith('en'))

  if (preferredVoice) {
    utterance.voice = preferredVoice
  }

  utterance.onend = () => {
    activeUtterance = null
    onEnd?.()
  }

  utterance.onerror = (e) => {
    console.warn('Speech synthesis error:', e)
    activeUtterance = null
    onEnd?.()
  }

  activeUtterance = utterance
  window.speechSynthesis.speak(utterance)
  return true
}

export function stopSpeech(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel()
    activeUtterance = null
  }
}

export function isCurrentlySpeaking(): boolean {
  return isSpeechSynthesisSupported() && window.speechSynthesis.speaking
}
