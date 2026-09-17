import prisma from '../src/lib/db'
import { explainTextWithAI } from '../src/lib/ai'
import { transcribeAudio } from '../src/lib/asr'

async function runVerification() {
  console.log('=== Verifying Database & Models ===')
  const userCount = await prisma.user.count()
  const videoCount = await prisma.video.count()
  const segmentCount = await prisma.segment.count()
  const keyTermCount = await prisma.keyTerm.count()

  console.log(`Users: ${userCount}`)
  console.log(`Videos: ${videoCount}`)
  console.log(`Transcript Segments: ${segmentCount}`)
  console.log(`Key Terms: ${keyTermCount}`)

  if (videoCount === 0 || segmentCount === 0 || keyTermCount === 0) {
    throw new Error('Verification failed: Seed data missing!')
  }

  console.log('\n=== Verifying Lesson Retrieval ===')
  const firstVideo = await prisma.video.findFirst({
    include: {
      segments: { orderBy: { startTime: 'asc' } },
      keyTerms: true,
    },
  })

  if (!firstVideo) throw new Error('No video found')
  console.log(`Lesson: "${firstVideo.title}"`)
  console.log(`Duration: ${firstVideo.duration}s`)
  console.log(`First segment: "${firstVideo.segments[0]?.text}"`)
  console.log(`First key term: "${firstVideo.keyTerms[0]?.term}" -> "${firstVideo.keyTerms[0]?.explanation}"`)

  console.log('\n=== Verifying AI Explanation Service ===')
  const sampleExplanation = await explainTextWithAI(
    'Chlorophyll',
    firstVideo.title,
    firstVideo.segments.map((s) => s.text).join(' ')
  )
  console.log(`AI Explanation Result:\n${sampleExplanation}`)

  console.log('\n=== Verifying ASR Fallback/Mock Service ===')
  const asrSegments = await transcribeAudio('dummy-path.mp4')
  console.log(`ASR returned ${asrSegments.length} segments with timestamps. First: [${asrSegments[0]?.startTime}s - ${asrSegments[0]?.endTime}s] "${asrSegments[0]?.text}"`)

  console.log('\nAll verification checks passed!')
}

runVerification()
  .catch((e) => {
    console.error('Verification failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
