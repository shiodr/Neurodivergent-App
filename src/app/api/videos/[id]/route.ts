import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        segments: {
          orderBy: { startTime: 'asc' },
        },
        keyTerms: {
          orderBy: { term: 'asc' },
        },
      },
    })

    if (!video) {
      return NextResponse.json({ error: 'Lesson video not found' }, { status: 404 })
    }

    return NextResponse.json(video)
  } catch (error) {
    console.error('Failed to get video:', error)
    return NextResponse.json({ error: 'Failed to retrieve video' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.video.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Video deleted successfully' })
  } catch (error) {
    console.error('Failed to delete video:', error)
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
  }
}
