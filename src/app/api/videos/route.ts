import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { saveUploadedFile } from '@/lib/storage'
import { transcribeAudio } from '@/lib/asr'
import { extractKeyTerms } from '@/lib/ai'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where = status ? { status } : {}

    const videos = await prisma.video.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            segments: true,
            keyTerms: true,
          },
        },
      },
    })

    return NextResponse.json(videos)
  } catch (error) {
    console.error('Failed to list videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string | null
    const description = (formData.get('description') as string) || ''
    const uploaderId = (formData.get('uploaderId') as string) || ''

    if (!file || !title) {
      return NextResponse.json(
        { error: 'File and title are required.' },
        { status: 400 }
      )
    }

    // Ensure we have a valid teacher or default user
    let user = null
    if (uploaderId) {
      user = await prisma.user.findUnique({ where: { id: uploaderId } })
    }
    if (!user) {
      user = await prisma.user.findFirst({ where: { role: 'TEACHER' } })
    }
    if (!user) {
      user = await prisma.user.findFirst()
    }
    if (!user) {
      // Create a fallback teacher
      user = await prisma.user.create({
        data: {
          email: 'teacher@school.edu',
          password: 'temp',
          name: 'Teacher',
          role: 'TEACHER',
        },
      })
    }

    // 1. Save uploaded file
    const { filename, publicUrl } = await saveUploadedFile(file)

    // 2. Create Video in DB with PROCESSING status
    const video = await prisma.video.create({
      data: {
        title,
        description,
        filename: publicUrl,
        mimetype: file.type || 'video/mp4',
        status: 'PROCESSING',
        uploaderId: user.id,
      },
    })

    // 3. Run ASR Pipeline
    try {
      const segments = await transcribeAudio(filename)

      // Store segments in DB
      if (segments && segments.length > 0) {
        await prisma.segment.createMany({
          data: segments.map((seg) => ({
            videoId: video.id,
            startTime: seg.startTime,
            endTime: seg.endTime,
            text: seg.text,
            index: seg.index,
          })),
        })

        // 4. Run AI Key-term extraction
        const fullTranscript = segments.map((s) => s.text).join(' ')
        const keyTerms = await extractKeyTerms(fullTranscript, segments)

        if (keyTerms && keyTerms.length > 0) {
          await prisma.keyTerm.createMany({
            data: keyTerms.map((k) => ({
              videoId: video.id,
              term: k.term,
              explanation: k.explanation,
              segmentRef: k.segmentRef ?? 0,
              ageGroup: k.ageGroup || 'general',
            })),
          })
        }

        // Calculate approximate duration from last segment
        const lastSeg = segments[segments.length - 1]
        const duration = lastSeg ? lastSeg.endTime : null

        await prisma.video.update({
          where: { id: video.id },
          data: {
            status: 'READY',
            duration,
          },
        })
      } else {
        await prisma.video.update({
          where: { id: video.id },
          data: { status: 'READY' },
        })
      }
    } catch (pipelineError) {
      console.error('ASR/AI Pipeline processing error:', pipelineError)
      await prisma.video.update({
        where: { id: video.id },
        data: { status: 'ERROR' },
      })
    }

    const completedVideo = await prisma.video.findUnique({
      where: { id: video.id },
      include: {
        segments: { orderBy: { index: 'asc' } },
        keyTerms: true,
      },
    })

    return NextResponse.json(completedVideo, { status: 201 })
  } catch (error) {
    console.error('Upload failed:', error)
    return NextResponse.json(
      { error: 'Video upload and processing failed.' },
      { status: 500 }
    )
  }
}
