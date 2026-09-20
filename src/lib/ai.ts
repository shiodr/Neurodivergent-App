import OpenAI from 'openai'
import {
  AI_SYSTEM_PROMPT_EXPLAIN,
  AI_SYSTEM_PROMPT_KEYTERMS,
  AI_SYSTEM_PROMPT_CHAT,
  AI_SYSTEM_PROMPT_SUMMARY,
  AI_SYSTEM_PROMPT_PRACTICE,
} from './prompts'

export interface ExtractedKeyTerm {
  term: string
  explanation: string
  segmentRef?: number
  ageGroup: string
}

export async function extractKeyTerms(
  transcriptText: string,
  segments: { index: number; text: string }[]
): Promise<ExtractedKeyTerm[]> {
  const apiKey = process.env.OPENAI_API_KEY

  if (apiKey && apiKey.trim() !== '') {
    try {
      const openai = new OpenAI({ apiKey })

      const prompt = `Lesson Segments:
${segments.map((s) => `[Segment ${s.index}]: ${s.text}`).join('\n')}

Extract key scientific or educational terms according to system instructions.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          { role: 'system', content: AI_SYSTEM_PROMPT_KEYTERMS },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      })

      const content = completion.choices[0]?.message?.content
      if (content) {
        const parsed = JSON.parse(content)
        const terms = Array.isArray(parsed) ? parsed : parsed.terms || []
        return terms.map((item: { term: string; explanation: string; segmentRef?: number; ageGroup?: string }) => ({
          term: item.term,
          explanation: item.explanation,
          segmentRef: typeof item.segmentRef === 'number' ? item.segmentRef : 0,
          ageGroup: item.ageGroup || 'general',
        }))
      }
    } catch (error) {
      console.warn('OpenAI Key-term extraction failed, using fallback:', error)
    }
  }

  // Fallback intelligent heuristics for key-term extraction
  return generateFallbackKeyTerms(transcriptText)
}

export type ExplainMode = 'simple' | 'analogy' | 'deep' | 'age-10'

export async function explainTextWithAI(
  selectedText: string,
  lessonTitle: string = 'Lesson',
  lessonContext: string = '',
  mode: ExplainMode = 'simple'
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY

  let instructionVariant = 'Please provide a clear, concise, age-appropriate simplified explanation.'
  if (mode === 'age-10') {
    instructionVariant = 'Explain this specifically for a 10-year-old child using a fun, relatable analogy (like toys, cooking, playground, or pets).'
  } else if (mode === 'analogy') {
    instructionVariant = 'Explain this primarily by comparing it to an intuitive everyday real-world object or situation.'
  } else if (mode === 'deep') {
    instructionVariant = 'Provide a deeper explanation showing the step-by-step scientific mechanism behind this, while keeping the language calm and free of unnecessary jargon.'
  }

  if (apiKey && apiKey.trim() !== '') {
    try {
      const openai = new OpenAI({ apiKey })

      const prompt = `Lesson Topic: "${lessonTitle}"
Relevant Lesson Context:
"${lessonContext.slice(0, 800)}"

Student highlighted the phrase:
"${selectedText}"

Mode: ${mode.toUpperCase()}
Instruction: ${instructionVariant}`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 300,
        messages: [
          { role: 'system', content: AI_SYSTEM_PROMPT_EXPLAIN },
          { role: 'user', content: prompt },
        ],
      })

      const explanation = completion.choices[0]?.message?.content
      if (explanation) {
        return explanation.trim()
      }
    } catch (error) {
      console.warn('OpenAI explanation request failed, using fallback:', error)
    }
  }

  // Graceful rule-based fallback explanation
  if (mode === 'age-10') {
    return `Think of "${selectedText}" like a special helper in ${lessonTitle.toLowerCase()}! Just like how a recipe needs exact ingredients to make delicious cookies, this part does one specific job to make the whole process work.`
  }
  if (mode === 'analogy') {
    return `"${selectedText}" is like a kitchen blender: it takes raw ingredients from nature and transforms them into something useful for ${lessonTitle.toLowerCase()}.`
  }
  if (mode === 'deep') {
    return `In deeper detail, "${selectedText}" plays an essential role in ${lessonTitle.toLowerCase()}: it participates in the sequence of steps that transfers energy and molecules across the system. Check the segment transcript for exact teacher details!`
  }
  return `"${selectedText}" in this lesson refers to an important building block of the topic. In simple words, it describes how elements interact and work together in ${lessonTitle.toLowerCase()}. Ask your teacher for further classroom examples!`
}

export interface ChatAIParams {
  query: string
  history?: { role: 'user' | 'assistant'; content: string }[]
  lessonTitle: string
  segments: { index: number; startTime: number; endTime: number; text: string }[]
  keyTerms: { term: string; explanation: string }[]
  ageGroup?: 'elementary' | 'high-school'
  currentVideoTime?: number
  action?: string
}

export interface ChatAIResponse {
  response: string
  suggestedFollowUps: string[]
}

export async function chatWithLessonAI(params: ChatAIParams): Promise<ChatAIResponse> {
  const {
    query,
    history = [],
    lessonTitle,
    segments = [],
    keyTerms = [],
    ageGroup = 'elementary',
    currentVideoTime = 0,
    action,
  } = params

  const apiKey = process.env.OPENAI_API_KEY

  // 1. RAG Segment Retrieval
  // Prioritize segments close to current playback time or matching query keywords
  const recentSegments = segments.filter(
    (s) => s.startTime <= currentVideoTime && s.endTime >= currentVideoTime - 120
  )
  const queryLower = query.toLowerCase()
  const keywordMatches = segments.filter((s) => {
    const words = queryLower.split(/\s+/).filter((w) => w.length > 3)
    return words.some((w) => s.text.toLowerCase().includes(w))
  })

  // Combine and deduplicate
  const relevantSegmentsMap = new Map<number, (typeof segments)[0]>()
  for (const s of recentSegments) relevantSegmentsMap.set(s.index, s)
  for (const s of keywordMatches) relevantSegmentsMap.set(s.index, s)
  // If still fewer than 3, add surrounding segments
  if (relevantSegmentsMap.size === 0) {
    segments.slice(0, 4).forEach((s) => relevantSegmentsMap.set(s.index, s))
  }
  const ragSegments = Array.from(relevantSegmentsMap.values()).sort(
    (a, b) => a.startTime - b.startTime
  )

  const transcriptContext = ragSegments
    .map((s) => `[${formatTimeSec(s.startTime)} - ${formatTimeSec(s.endTime)}] (Seg ${s.index}): ${s.text}`)
    .join('\n')

  const termsContext = keyTerms
    .slice(0, 6)
    .map((k) => `• ${k.term}: ${k.explanation}`)
    .join('\n')

  if (apiKey && apiKey.trim() !== '') {
    try {
      const openai = new OpenAI({ apiKey })

      const prompt = `Lesson Title: "${lessonTitle}"
Current Video Playback Time: ${formatTimeSec(currentVideoTime)}
Target Learner Level: ${ageGroup.toUpperCase()}
Shortcut Action Triggered: ${action || 'None'}

Relevant Lesson Transcript Segments:
${transcriptContext}

Key Lesson Terms:
${termsContext}

Student Question / Prompt:
"${query}"`

      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: AI_SYSTEM_PROMPT_CHAT },
        ...history.slice(-4).map((h) => ({
          role: h.role as 'user' | 'assistant',
          content: h.content,
        })),
        { role: 'user', content: prompt },
      ]

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages,
        response_format: { type: 'json_object' },
      })

      const content = completion.choices[0]?.message?.content
      if (content) {
        const parsed = JSON.parse(content)
        return {
          response: parsed.response || parsed.answer || parsed.message || '',
          suggestedFollowUps: Array.isArray(parsed.suggestedFollowUps)
            ? parsed.suggestedFollowUps.slice(0, 3)
            : ['Explain this more simply', 'What is the main takeaway?', 'Give an analogy'],
        }
      }
    } catch (error) {
      console.warn('OpenAI chat request failed, falling back:', error)
    }
  }

  // Intelligent, grounded fallback engine
  return generateFallbackChatResponse({
    query,
    lessonTitle,
    segments,
    keyTerms,
    currentVideoTime,
    ageGroup,
    action,
    ragSegments,
  })
}

function formatTimeSec(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

interface FallbackChatContext {
  query: string
  lessonTitle: string
  segments: { index: number; startTime: number; endTime: number; text: string }[]
  keyTerms: { term: string; explanation: string }[]
  currentVideoTime: number
  ageGroup: 'elementary' | 'high-school'
  action?: string
  ragSegments: { index: number; startTime: number; endTime: number; text: string }[]
}

function generateFallbackChatResponse(ctx: FallbackChatContext): ChatAIResponse {
  const q = ctx.query.toLowerCase()
  const activeSeg =
    ctx.segments.find(
      (s) => ctx.currentVideoTime >= s.startTime && ctx.currentVideoTime <= s.endTime
    ) || ctx.segments[0]

  // Check matching key term
  const matchedTerm = ctx.keyTerms.find(
    (k) => q.includes(k.term.toLowerCase()) || (activeSeg && activeSeg.text.toLowerCase().includes(k.term.toLowerCase()))
  )

  if (ctx.action === 'confused' || q.includes('confused') || q.includes('help')) {
    const concept = matchedTerm ? matchedTerm.term : 'this part of the lesson'
    const explanation = matchedTerm
      ? matchedTerm.explanation
      : activeSeg
      ? activeSeg.text
      : 'the core concept'
    return {
      response:
        ctx.ageGroup === 'elementary'
          ? `It is totally normal to feel stuck! Let's pause and breathe. Right here, the teacher is talking about ${concept}. In simple words: ${explanation}. Take it one step at a time!`
          : `Don't worry — this concept has a few moving parts. Here is the core intuition: ${explanation}. You can rewind 15 seconds to hear the teacher introduce it again.`,
      suggestedFollowUps: [
        'Explain this like I am 10',
        'Can you give an analogy?',
        'What was the main idea just now?',
      ],
    }
  }

  if (ctx.action === 'main-idea' || q.includes('main idea') || q.includes('takeaway')) {
    const summaryText = activeSeg
      ? activeSeg.text
      : ctx.segments[0]?.text || 'the primary lesson concept'
    return {
      response: `The main idea right here is: ${summaryText}. The key thing to remember is how this step connects to ${ctx.lessonTitle}.`,
      suggestedFollowUps: [
        'Explain this more simply',
        'Why does this matter?',
        'Give me a practice question',
      ],
    }
  }

  if (ctx.action === 'summarize-recent' || q.includes('last 3 minutes') || q.includes('recent')) {
    const recent = ctx.segments.filter((s) => s.endTime <= Math.max(ctx.currentVideoTime, 60))
    const texts = recent.slice(-3).map((s) => s.text)
    return {
      response: `Here is a quick recap of the recent lesson: ${texts.join(' ')}`,
      suggestedFollowUps: [
        'Explain this more simply',
        'Am I ready for a quick check?',
        'I am confused – help',
      ],
    }
  }

  if (ctx.action === 'explain-simply' || q.includes('simply') || q.includes('simpler')) {
    const definition = matchedTerm
      ? matchedTerm.explanation
      : activeSeg?.text || 'the fundamental idea behind this topic'
    return {
      response:
        ctx.ageGroup === 'elementary'
          ? `Here is the simple version: ${definition}. Think of it like pieces of a puzzle clicking together nicely!`
          : `Simplified summary: ${definition}. This is the central mechanism without the extra technical terminology.`,
      suggestedFollowUps: [
        'Give me an everyday analogy',
        'What was the main idea just now?',
        'Test me on this',
      ],
    }
  }

  if (matchedTerm) {
    return {
      response: `In this lesson, **${matchedTerm.term}** means: ${matchedTerm.explanation}. It is one of the main keys to understanding ${ctx.lessonTitle}.`,
      suggestedFollowUps: [
        `Explain ${matchedTerm.term} like I'm 10`,
        'Can you give an analogy?',
        'What was the main idea just now?',
      ],
    }
  }

  // Default grounded fallback response
  const firstText = ctx.ragSegments[0]?.text || activeSeg?.text || ctx.lessonTitle
  return {
    response: `Based on your lesson on **${ctx.lessonTitle}**: "${firstText}". This is a foundational step that powers the entire topic!`,
    suggestedFollowUps: [
      'Explain this more simply',
      'What was the main idea just now?',
      'I am confused – help',
    ],
  }
}

export async function generateLessonSummary(
  lessonTitle: string,
  segments: { text: string }[],
  ageGroup: 'elementary' | 'high-school' = 'elementary'
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY

  if (apiKey && apiKey.trim() !== '') {
    try {
      const openai = new OpenAI({ apiKey })
      const transcript = segments.map((s) => s.text).join(' ')

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 200,
        messages: [
          { role: 'system', content: AI_SYSTEM_PROMPT_SUMMARY },
          {
            role: 'user',
            content: `Lesson: "${lessonTitle}"\nLearner Age Level: ${ageGroup}\nTranscript: "${transcript.slice(0, 2000)}"`,
          },
        ],
      })

      const text = completion.choices[0]?.message?.content?.trim()
      if (text) return text
    } catch (error) {
      console.warn('Lesson summary AI failed, falling back:', error)
    }
  }

  // Fallback summary
  if (segments.length > 0) {
    return `In "${lessonTitle}", you will discover how key parts work together in nature. ${segments[0]?.text} Follow along step-by-step to see how the whole process connects!`
  }
  return `This lesson explores the fascinating core concepts of ${lessonTitle}. Relax, watch in short chunks, and use the companion tools whenever you need extra help!`
}

export async function generatePracticeQuestions(
  lessonTitle: string,
  segments: { index: number; text: string }[],
  keyTerms: { term: string; explanation: string; segmentRef?: number | null }[]
): Promise<{ question: string; answer: string; hint?: string; options: string[]; segmentRef?: number }[]> {
  const apiKey = process.env.OPENAI_API_KEY

  if (apiKey && apiKey.trim() !== '') {
    try {
      const openai = new OpenAI({ apiKey })
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          { role: 'system', content: AI_SYSTEM_PROMPT_PRACTICE },
          {
            role: 'user',
            content: `Lesson: "${lessonTitle}"\nKey Terms:\n${keyTerms.map((k) => `- ${k.term}: ${k.explanation}`).join('\n')}\nTranscript Sample:\n${segments.slice(0, 6).map((s) => s.text).join(' ')}`,
          },
        ],
        response_format: { type: 'json_object' },
      })

      const content = completion.choices[0]?.message?.content
      if (content) {
        const parsed = JSON.parse(content)
        const list = Array.isArray(parsed) ? parsed : parsed.questions || []
        if (list.length > 0) {
          return list.map((item: { question: string; answer: string; hint?: string; options: string[]; segmentRef?: number }) => ({
            question: item.question,
            answer: item.answer,
            hint: item.hint || 'Review the corresponding lesson segment.',
            options: Array.isArray(item.options) ? item.options : [item.answer],
            segmentRef: item.segmentRef || 0,
          }))
        }
      }
    } catch (error) {
      console.warn('Practice questions AI failed, falling back:', error)
    }
  }

  // Intelligent fallback practice questions from key terms
  if (keyTerms.length >= 2) {
    return keyTerms.slice(0, 3).map((term, i) => {
      const otherTerms = keyTerms.filter((k) => k.term !== term.term).map((k) => k.term)
      const options = [term.term, ...otherTerms.slice(0, 3)]
      // simple deterministic shuffle
      options.sort()
      return {
        question: `Which term describes: "${term.explanation.slice(0, 100)}"?`,
        answer: term.term,
        hint: `It starts with the letter "${term.term.charAt(0)}".`,
        options,
        segmentRef: term.segmentRef ?? i,
      }
    })
  }

  return [
    {
      question: `What is the central topic of this lesson?`,
      answer: lessonTitle,
      hint: 'Look at the title at the top of your screen.',
      options: [lessonTitle, 'Unrelated topic', 'General Science', 'Review'],
      segmentRef: 0,
    },
  ]
}

function generateFallbackKeyTerms(transcript: string): ExtractedKeyTerm[] {
  const fallbackLibrary: Record<string, string> = {
    photosynthesis:
      'The process where green plants turn sunlight, water, and air into energy and oxygen.',
    chlorophyll:
      'The green pigment in leaves that absorbs sunlight for photosynthesis.',
    chloroplasts:
      'Tiny structures inside plant cells where food is produced.',
    stomata:
      'Microscopic pores on leaves that allow carbon dioxide in and oxygen out.',
    glucose:
      'A simple sugar made by plants to nourish themselves and help them grow.',
    evaporation:
      'When the warmth of the sun turns liquid water into invisible vapor rising into the air.',
    condensation:
      'When rising water vapor cools down and forms clouds.',
    precipitation:
      'Water falling back to Earth as rain, snow, or hail.',
    transpiration:
      'Water vapor released into the air by living plants.',
    energy:
      'The power that allows living things to grow, move, and function.',
    cycle:
      'A series of events that repeat continuously in nature.',
  }

  const results: ExtractedKeyTerm[] = []
  const lowerTranscript = transcript.toLowerCase()

  for (const [term, explanation] of Object.entries(fallbackLibrary)) {
    if (lowerTranscript.includes(term)) {
      results.push({
        term: term.charAt(0).toUpperCase() + term.slice(1),
        explanation,
        segmentRef: 0,
        ageGroup: 'general',
      })
    }
  }

  // If none matched, supply standard educational foundations
  if (results.length === 0) {
    results.push(
      {
        term: 'Key Concept',
        explanation: 'The central idea or principle presented in this section of the lesson.',
        segmentRef: 0,
        ageGroup: 'general',
      },
      {
        term: 'Core Mechanism',
        explanation: 'The step-by-step way this process happens in nature.',
        segmentRef: 1,
        ageGroup: 'general',
      }
    )
  }

  return results
}
