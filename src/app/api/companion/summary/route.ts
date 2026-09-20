import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { generateLessonSummary } from '@/lib/ai'
import { AI_DISCLAIMER_TEXT } from '@/lib/prompts'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')
    const ageGroup = (searchParams.get('ageGroup') as 'elementary' | 'high-school') || 'elementary'

    if (!videoId) {
      return NextResponse.json({ error: 'videoId is required' }, { status: 400 })
    }

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        segments: { orderBy: { startTime: 'asc' } },
        chapters: { orderBy: { index: 'asc' } },
      },
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    let summary = video.summary
    if (!summary) {
      summary = await generateLessonSummary(video.title, video.segments, ageGroup)
      // Cache summary in database
      await prisma.video.update({
        where: { id: videoId },
        data: { summary },
      })
    }

    return NextResponse.json({
      title: video.title,
      summary,
      chapters: video.chapters,
      disclaimer: AI_DISCLAIMER_TEXT,
    })
  } catch (error) {
    console.error('Companion Summary API error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve lesson summary.' },
      { status: 500 }
    )
  }
}
