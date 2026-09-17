import OpenAI from 'openai'
import { AI_SYSTEM_PROMPT_EXPLAIN, AI_SYSTEM_PROMPT_KEYTERMS } from './prompts'

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

export async function explainTextWithAI(
  selectedText: string,
  lessonTitle: string = 'Lesson',
  lessonContext: string = ''
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY

  if (apiKey && apiKey.trim() !== '') {
    try {
      const openai = new OpenAI({ apiKey })

      const prompt = `Lesson Topic: "${lessonTitle}"
Relevant Lesson Context:
"${lessonContext.slice(0, 500)}"

Student highlighted the phrase:
"${selectedText}"

Please provide a clear, concise, age-appropriate simplified explanation.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 250,
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
  return `"${selectedText}" in this lesson refers to an important building block of the topic. In simple words, it describes how elements interact and work together in ${lessonTitle.toLowerCase()}. Ask your teacher for further classroom examples!`
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
