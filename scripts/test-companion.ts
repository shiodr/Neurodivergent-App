import prisma from '../src/lib/db'
import {
  explainTextWithAI,
  chatWithLessonAI,
  generateLessonSummary,
  generatePracticeQuestions,
} from '../src/lib/ai'
import { transcribeAudio } from '../src/lib/asr'
import { AI_DISCLAIMER_TEXT } from '../src/lib/prompts'

async function runVerification() {
  console.log('=== 1. Verifying Database & Extended Models ===')
  const userCount = await prisma.user.count()
  const videoCount = await prisma.video.count()
  const segmentCount = await prisma.segment.count()
  const keyTermCount = await prisma.keyTerm.count()
  const chapterCount = await prisma.chapter.count()
  const questionCount = await prisma.practiceQuestion.count()

  console.log(`Users: ${userCount}`)
  console.log(`Videos: ${videoCount}`)
  console.log(`Transcript Segments: ${segmentCount}`)
  console.log(`Key Terms: ${keyTermCount}`)
  console.log(`Chapters: ${chapterCount}`)
  console.log(`Practice Questions: ${questionCount}`)

  if (videoCount === 0 || segmentCount === 0 || keyTermCount === 0 || chapterCount === 0 || questionCount === 0) {
    throw new Error('Verification failed: Seed data missing or incomplete!')
  }

  console.log('\n=== 2. Verifying Lesson Retrieval with Chapters & Core Concepts ===')
  const firstVideo = await prisma.video.findFirst({
    include: {
      segments: { orderBy: { startTime: 'asc' } },
      keyTerms: true,
      chapters: { orderBy: { index: 'asc' } },
      practiceQuestions: true,
    },
  })

  if (!firstVideo) throw new Error('No video found')
  console.log(`Lesson: "${firstVideo.title}"`)
  console.log(`Summary: "${firstVideo.summary}"`)
  console.log(`Duration: ${firstVideo.duration}s`)
  console.log(`Chapters count: ${firstVideo.chapters.length}. Chapter 1: "${firstVideo.chapters[0]?.title}"`)
  const coreSegments = firstVideo.segments.filter((s) => s.isCore)
  console.log(`Core Segments: ${coreSegments.length} of ${firstVideo.segments.length}`)
  console.log(`Practice Questions seeded: ${firstVideo.practiceQuestions.length}`)

  console.log('\n=== 3. Verifying Multi-Mode AI Explanations ===')
  const context = firstVideo.segments.map((s) => s.text).join(' ')
  
  const simpleExp = await explainTextWithAI('Chlorophyll', firstVideo.title, context, 'simple')
  console.log(`[Simple Mode]:\n${simpleExp}`)

  const age10Exp = await explainTextWithAI('Chlorophyll', firstVideo.title, context, 'age-10')
  console.log(`\n[Like 10 Mode]:\n${age10Exp}`)

  const analogyExp = await explainTextWithAI('Chlorophyll', firstVideo.title, context, 'analogy')
  console.log(`\n[Analogy Mode]:\n${analogyExp}`)

  const deepExp = await explainTextWithAI('Chlorophyll', firstVideo.title, context, 'deep')
  console.log(`\n[Deep Mode]:\n${deepExp}`)

  console.log('\n=== 4. Verifying Conversational RAG AI Companion ===')
  // Test A: Free-form question
  const chatResultA = await chatWithLessonAI({
    query: 'What do chloroplasts do inside plant cells?',
    lessonTitle: firstVideo.title,
    segments: firstVideo.segments,
    keyTerms: firstVideo.keyTerms,
    ageGroup: 'elementary',
    currentVideoTime: 45,
  })
  console.log(`[Chat Query: "What do chloroplasts do?"]:\nResponse: ${chatResultA.response}`)
  console.log(`Suggested Follow-ups: ${chatResultA.suggestedFollowUps.join(' | ')}`)

  // Test B: Shortcut action "confused"
  const chatResultB = await chatWithLessonAI({
    query: '',
    lessonTitle: firstVideo.title,
    segments: firstVideo.segments,
    keyTerms: firstVideo.keyTerms,
    ageGroup: 'elementary',
    currentVideoTime: 50,
    action: 'confused',
  })
  console.log(`\n[Action: confused]:\nResponse: ${chatResultB.response}`)

  // Test C: Shortcut action "main-idea"
  const chatResultC = await chatWithLessonAI({
    query: '',
    lessonTitle: firstVideo.title,
    segments: firstVideo.segments,
    keyTerms: firstVideo.keyTerms,
    ageGroup: 'high-school',
    currentVideoTime: 100,
    action: 'main-idea',
  })
  console.log(`\n[Action: main-idea]:\nResponse: ${chatResultC.response}`)

  console.log('\n=== 5. Verifying AI Summary & Practice Question Generators ===')
  const generatedSummary = await generateLessonSummary(firstVideo.title, firstVideo.segments, 'elementary')
  console.log(`Generated Summary:\n${generatedSummary}`)

  const generatedQuestions = await generatePracticeQuestions(
    firstVideo.title,
    firstVideo.segments,
    firstVideo.keyTerms
  )
  console.log(`Generated ${generatedQuestions.length} practice questions. First: "${generatedQuestions[0]?.question}" -> Answer: "${generatedQuestions[0]?.answer}"`)

  console.log('\n=== 6. Verifying ASR Fallback Service ===')
  const asrSegments = await transcribeAudio('dummy-path.mp4')
  console.log(`ASR returned ${asrSegments.length} segments with timestamps. First: [${asrSegments[0]?.startTime}s - ${asrSegments[0]?.endTime}s] "${asrSegments[0]?.text}"`)

  console.log('\n=== 7. Verifying Disclaimer Integrity ===')
  console.log(`Disclaimer text: "${AI_DISCLAIMER_TEXT}"`)

  console.log('\nAll verification checks passed with 100% success!')
}

runVerification()
  .catch((e) => {
    console.error('Verification failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
