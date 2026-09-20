import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { explainTextWithAI } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, videoId, mode = 'simple' } = body

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return NextResponse.json({ error: 'Text is required for explanation.' }, { status: 400 })
    }

    let lessonTitle = 'Lesson'
    let lessonContext = ''

    if (videoId) {
      const video = await prisma.video.findUnique({
        where: { id: videoId },
        include: {
          segments: {
            take: 8,
          },
        },
      })

      if (video) {
        lessonTitle = video.title
        lessonContext = video.segments.map((s) => s.text).join(' ')
      }
    }

    const explanation = await explainTextWithAI(text, lessonTitle, lessonContext, mode)

    return NextResponse.json({
      term: text,
      explanation,
      mode,
    })
  } catch (error) {
    console.error('Explain API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate explanation. Please try again.' },
      { status: 500 }
    )
  }
}
