import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { chatWithLessonAI } from '@/lib/ai'
import { AI_DISCLAIMER_TEXT } from '@/lib/prompts'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      videoId,
      query,
      history = [],
      currentVideoTime = 0,
      ageGroup = 'elementary',
      action,
    } = body

    if (!videoId) {
      return NextResponse.json({ error: 'videoId is required' }, { status: 400 })
    }

    if (!query && !action) {
      return NextResponse.json({ error: 'query or action is required' }, { status: 400 })
    }

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        segments: {
          orderBy: { startTime: 'asc' },
        },
        keyTerms: true,
      },
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const result = await chatWithLessonAI({
      query: query || action || 'Help me understand this lesson',
      history,
      lessonTitle: video.title,
      segments: video.segments,
      keyTerms: video.keyTerms,
      ageGroup,
      currentVideoTime: Number(currentVideoTime) || 0,
      action,
    })

    return NextResponse.json({
      response: result.response,
      suggestedFollowUps: result.suggestedFollowUps,
      disclaimer: AI_DISCLAIMER_TEXT,
    })
  } catch (error) {
    console.error('Companion Chat API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate chat response. Please try again.',
        disclaimer: AI_DISCLAIMER_TEXT,
      },
      { status: 500 }
    )
  }
}
