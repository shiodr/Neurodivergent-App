'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  MessageSquareHeart,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Clock,
  Lightbulb,
  ShieldAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { speakText, stopSpeech, isCurrentlySpeaking } from '@/lib/tts'
import { AI_DISCLAIMER_TEXT } from '@/lib/prompts'
import type { ChatMessage, AgeGroup } from '@/types'

interface ConversationalCompanionProps {
  videoId: string
  currentTime: number
  ageGroup: AgeGroup
  highContrast: boolean
  onAgeGroupChange: (age: AgeGroup) => void
  onSeek?: (time: number) => void
}

const STORAGE_PREFIX = 'nd-chat-history-'

const QUICK_PROMPTS = [
  { label: 'Explain this more simply', action: 'explain-simply', icon: Lightbulb },
  { label: 'What was the main idea just now?', action: 'main-idea', icon: Sparkles },
  { label: 'I’m confused – help', action: 'confused', icon: HelpCircle },
  { label: 'Summarize the last 3 minutes', action: 'summarize-recent', icon: Clock },
]

export function ConversationalCompanion({
  videoId,
  currentTime,
  ageGroup,
  highContrast,
  onAgeGroupChange,
  onSeek,
}: ConversationalCompanionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load chat history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${videoId}`)
      if (stored) {
        setMessages(JSON.parse(stored))
      } else {
        // Initial friendly welcome message
        const welcome: ChatMessage = {
          id: 'welcome',
          role: 'assistant',
          content:
            ageGroup === 'elementary'
              ? 'Hi! I am your AI Lesson Helper. You can ask me any question about this lesson, or click one of the quick question buttons below!'
              : 'Welcome to your AI Lesson Companion. Ask any conceptual or clarifying questions about this video lecture, or use the quick buttons for rapid recaps.',
          timestamp: Date.now(),
          suggestedActions: [
            'What was the main idea just now?',
            'Explain this more simply',
            'I’m confused – help',
          ],
        }
        setMessages([welcome])
      }
    } catch {
      // fallback
    }
  }, [videoId, ageGroup])

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(`${STORAGE_PREFIX}${videoId}`, JSON.stringify(messages))
      } catch {
        // ignore storage errors
      }
    }
  }, [messages, videoId])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSendMessage = async (textToSend: string, action?: string) => {
    const trimmed = textToSend.trim()
    if (!trimmed && !action) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed || (action === 'confused' ? 'I am confused – help' : action === 'main-idea' ? 'What was the main idea just now?' : action === 'summarize-recent' ? 'Summarize the last 3 minutes' : 'Explain this more simply'),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/companion/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          query: trimmed,
          history: messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
          currentVideoTime: currentTime,
          ageGroup,
          action,
        }),
      })

      if (!res.ok) {
        throw new Error('Could not get response from assistant')
      }

      const data = await res.json()

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: Date.now(),
        suggestedActions: data.suggestedFollowUps,
      }

      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      const errorMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        role: 'assistant',
        content:
          'I could not reach the server right now, but your teacher can help answer questions about this lesson!',
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearChat = () => {
    stopSpeech()
    setSpeakingMessageId(null)
    const welcome: ChatMessage = {
      id: `welcome-${Date.now()}`,
      role: 'assistant',
      content:
        ageGroup === 'elementary'
          ? 'Chat reset! What would you like help with now?'
          : 'Chat history cleared. What part of the lesson shall we focus on?',
      timestamp: Date.now(),
      suggestedActions: [
        'What was the main idea just now?',
        'Explain this more simply',
        'I’m confused – help',
      ],
    }
    setMessages([welcome])
    localStorage.removeItem(`${STORAGE_PREFIX}${videoId}`)
  }

  const handleToggleSpeak = (msgId: string, text: string) => {
    if (speakingMessageId === msgId && isCurrentlySpeaking()) {
      stopSpeech()
      setSpeakingMessageId(null)
    } else {
      stopSpeech()
      setSpeakingMessageId(msgId)
      speakText(text, () => {
        setSpeakingMessageId(null)
      })
    }
  }

  return (
    <section
      className={`flex flex-col h-full rounded-2xl border-2 overflow-hidden shadow-sm ${
        highContrast ? 'bg-white border-black' : 'bg-gray-50/50 border-gray-200'
      }`}
      aria-label="Conversational AI Lesson Companion"
    >
      {/* Header Bar */}
      <div
        className={`p-3.5 sm:p-4 border-b-2 flex items-center justify-between gap-2 ${
          highContrast ? 'bg-black text-white border-black' : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
            <MessageSquareHeart className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold tracking-tight line-clamp-1">
              AI Lesson Companion
            </h2>
            <span className="text-[11px] text-gray-500 font-medium">Grounded in this lesson</span>
          </div>
        </div>

        {/* Age Level Toggle & Reset Button */}
        <div className="flex items-center gap-2">
          <div
            className={`inline-flex rounded-lg p-0.5 border text-xs font-bold ${
              highContrast ? 'bg-white text-black border-black' : 'bg-gray-100 border-gray-200'
            }`}
            role="group"
            aria-label="Explanation Complexity"
          >
            <button
              type="button"
              onClick={() => onAgeGroupChange('elementary')}
              className={`px-2 py-1 rounded-md transition-all ${
                ageGroup === 'elementary'
                  ? highContrast
                    ? 'bg-yellow-400 text-black font-extrabold'
                    : 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-pressed={ageGroup === 'elementary'}
            >
              Elementary
            </button>
            <button
              type="button"
              onClick={() => onAgeGroupChange('high-school')}
              className={`px-2 py-1 rounded-md transition-all ${
                ageGroup === 'high-school'
                  ? highContrast
                    ? 'bg-yellow-400 text-black font-extrabold'
                    : 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-pressed={ageGroup === 'high-school'}
            >
              High School
            </button>
          </div>

          <button
            type="button"
            onClick={handleClearChat}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            title="Clear Chat History"
            aria-label="Clear Chat History"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Required AI Safety Disclaimer */}
      <div
        className={`px-3 py-2 flex items-start gap-2 text-[11px] sm:text-xs border-b ${
          highContrast
            ? 'bg-amber-100 text-black border-black font-semibold'
            : 'bg-amber-50/80 text-amber-900 border-amber-200'
        }`}
        role="note"
      >
        <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-snug">{AI_DISCLAIMER_TEXT}</p>
      </div>

      {/* Messages Scroll Area */}
      <div
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3"
        tabIndex={0}
        role="log"
        aria-label="Chat messages"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user'
          const isSpeakingThis = speakingMessageId === msg.id

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed transition-all ${
                  isUser
                    ? highContrast
                      ? 'bg-black text-white font-bold border-2 border-black rounded-br-xs'
                      : 'bg-blue-600 text-white rounded-br-xs shadow-sm font-medium'
                    : highContrast
                    ? 'bg-white text-black font-medium border-2 border-black rounded-bl-xs'
                    : 'bg-white text-gray-800 border border-gray-200/90 rounded-bl-xs shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Assistant TTS Play Button */}
                {!isUser && (
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100/80">
                    <button
                      type="button"
                      onClick={() => handleToggleSpeak(msg.id, msg.content)}
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                        isSpeakingThis
                          ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-400'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      aria-label={isSpeakingThis ? 'Stop reading' : 'Read aloud with voice'}
                    >
                      {isSpeakingThis ? (
                        <>
                          <VolumeX className="w-3 h-3 text-emerald-700 animate-pulse" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                    <span className="text-[10px] text-gray-400">Lesson helper</span>
                  </div>
                )}
              </div>

              {/* Follow-up Suggested Action Chips */}
              {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {msg.suggestedActions.map((actionText, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleSendMessage(actionText)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                        highContrast
                          ? 'bg-white text-black border-black hover:bg-yellow-300'
                          : 'bg-emerald-50/80 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {actionText}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2 p-3 rounded-2xl bg-white border border-gray-200 max-w-[75%] shadow-sm animate-pulse">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-700">Thinking calmly...</p>
              <p className="text-[11px] text-gray-500">Checking the lesson transcript.</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Bar */}
      <div
        className={`px-3 py-2 border-t flex items-center gap-1.5 overflow-x-auto no-scrollbar ${
          highContrast ? 'bg-gray-100 border-black' : 'bg-gray-100/70 border-gray-200'
        }`}
        role="toolbar"
        aria-label="Quick Question Prompts"
      >
        <span className="text-[11px] font-bold text-gray-500 shrink-0 uppercase tracking-wider pl-1">
          Quick:
        </span>
        {QUICK_PROMPTS.map((prompt) => {
          const Icon = prompt.icon
          return (
            <button
              key={prompt.action}
              type="button"
              disabled={isLoading}
              onClick={() => handleSendMessage('', prompt.action)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all border ${
                highContrast
                  ? 'bg-white text-black border-black hover:bg-yellow-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-3 h-3 text-blue-600 shrink-0" />
              <span>{prompt.label}</span>
            </button>
          )
        })}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSendMessage(input)
        }}
        className={`p-2.5 sm:p-3 border-t flex items-center gap-2 ${
          highContrast ? 'bg-white border-black' : 'bg-white border-gray-200'
        }`}
      >
        <label htmlFor="companion-chat-input" className="sr-only">
          Ask a question about this lesson
        </label>
        <input
          id="companion-chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            ageGroup === 'elementary'
              ? 'Ask anything about this lesson...'
              : 'Ask a clarifying question about this video...'
          }
          disabled={isLoading}
          className={`flex-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm border-2 transition-all focus:outline-none focus:ring-3 focus:ring-blue-400 ${
            highContrast
              ? 'bg-white text-black border-black placeholder-gray-500'
              : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
          }`}
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          size="sm"
          className="font-bold gap-1 px-4 h-9"
          aria-label="Send message"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask</span>
        </Button>
      </form>
    </section>
  )
}
