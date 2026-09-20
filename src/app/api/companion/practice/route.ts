import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { generatePracticeQuestions } from '@/lib/ai'
import { AI_DISCLAIMER_TEXT } from '@/lib/prompts'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')

    if (!videoId) {
      return NextResponse.json({ error: 'videoId is required' }, { status: 400 })
    }

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        segments: { orderBy: { startTime: 'asc' } },
        keyTerms: true,
        practiceQuestions: true,
      },
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    let questions = video.practiceQuestions

    if (!questions || questions.length === 0) {
      const generated = await generatePracticeQuestions(
        video.title,
        video.segments,
        video.keyTerms
      )

      // Save to database
      for (const q of generated) {
        await prisma.practiceQuestion.create({
          data: {
            videoId: video.id,
            question: q.question,
            answer: q.answer,
            hint: q.hint,
            options: JSON.stringify(q.options),
            segmentRef: q.segmentRef,
          },
        })
      }

      questions = await prisma.practiceQuestion.findMany({
        where: { videoId: video.id },
      })
    }

    const formattedQuestions = questions.map((q) => ({
      id: q.id,
      question: q.question,
      answer: q.answer,
      hint: q.hint,
      options: q.options ? JSON.parse(q.options) : [],
      segmentRef: q.segmentRef,
    }))

    return NextResponse.json({
      questions: formattedQuestions,
      disclaimer: AI_DISCLAIMER_TEXT,
    })
  } catch (error) {
    console.error('Companion Practice API error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve practice questions.' },
      { status: 500 }
    )
  }
}
