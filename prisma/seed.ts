import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean existing data
  await prisma.keyTerm.deleteMany({})
  await prisma.segment.deleteMany({})
  await prisma.video.deleteMany({})
  await prisma.user.deleteMany({})

  // Create default teacher user
  const hashedPassword = await bcrypt.hash('teacher123', 10)
  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@school.edu',
      password: hashedPassword,
      name: 'Ms. Henderson',
      role: 'TEACHER',
    },
  })

  console.log(`Created teacher: ${teacher.email}`)

  // Create Sample Lesson 1: Photosynthesis
  const lesson1 = await prisma.video.create({
    data: {
      title: 'Introduction to Photosynthesis: How Plants Make Food',
      description:
        'A gentle, step-by-step introduction to how green plants turn sunlight, water, and air into energy and oxygen.',
      summary:
        'Plants create their own food through photosynthesis using sunlight, water, and carbon dioxide. Inside leaf cells, chloroplasts trap light to produce energy-rich glucose and release clean oxygen into the air.',
      filename: '/samples/photosynthesis.mp4',
      mimetype: 'video/mp4',
      duration: 180.0,
      status: 'READY',
      uploaderId: teacher.id,
      chapters: {
        create: [
          { index: 0, title: 'Introduction to Plant Food', startTime: 0.0, endTime: 38.0 },
          { index: 1, title: 'Inside Plant Cells: Chloroplasts', startTime: 38.0, endTime: 62.0 },
          { index: 2, title: 'Absorbing Water & Carbon Dioxide', startTime: 62.0, endTime: 95.0 },
          { index: 3, title: 'The Chemical Recipe: Glucose & Oxygen', startTime: 95.0, endTime: 158.0 },
          { index: 4, title: 'Review & Wrap Up', startTime: 158.0, endTime: 180.0 },
        ],
      },
      practiceQuestions: {
        create: [
          {
            question: 'What is the green pigment in leaves that traps sunlight?',
            answer: 'Chlorophyll',
            hint: 'It sounds like "chloro" and makes leaves look green.',
            options: JSON.stringify(['Chlorophyll', 'Glucose', 'Stomata', 'Oxygen']),
            segmentRef: 2,
          },
          {
            question: 'What simple sugar do plants make for food and energy?',
            answer: 'Glucose',
            hint: 'It is a sweet substance that powers the plant cells.',
            options: JSON.stringify(['Carbon dioxide', 'Water', 'Glucose', 'Sunlight']),
            segmentRef: 4,
          },
          {
            question: 'What gas do plants release into the air for humans and animals to breathe?',
            answer: 'Oxygen',
            hint: 'It is the fresh air you take in every breath.',
            options: JSON.stringify(['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Helium']),
            segmentRef: 5,
          },
        ],
      },
      segments: {
        create: [
          {
            startTime: 0.0,
            endTime: 18.5,
            index: 0,
            isCore: true,
            text: 'Welcome everyone! Today we are exploring photosynthesis, which is the wonderful process plants use to make their own food.',
          },
          {
            startTime: 18.5,
            endTime: 38.0,
            index: 1,
            isCore: false,
            text: 'Unlike animals who eat food from outside, plants are autotrophs. That means they produce their own energy right inside their green leaves.',
          },
          {
            startTime: 38.0,
            endTime: 62.0,
            index: 2,
            isCore: true,
            text: 'Inside plant cells are tiny solar panels called chloroplasts. These contain chlorophyll, the green pigment that traps sunlight.',
          },
          {
            startTime: 62.0,
            endTime: 95.0,
            index: 3,
            isCore: true,
            text: 'Plants absorb water through their roots from the soil, and they take in carbon dioxide gas from the air through microscopic openings called stomata.',
          },
          {
            startTime: 95.0,
            endTime: 130.0,
            index: 4,
            isCore: true,
            text: 'When sunlight hits the chlorophyll, a chemical reaction combines water and carbon dioxide to create glucose, a simple sugar used for energy.',
          },
          {
            startTime: 130.0,
            endTime: 158.0,
            index: 5,
            isCore: false,
            text: 'As a marvelous bonus for us and all living creatures, this process releases pure oxygen into the atmosphere for us to breathe.',
          },
          {
            startTime: 158.0,
            endTime: 180.0,
            index: 6,
            isCore: true,
            text: 'So to review the recipe: sunlight plus water plus carbon dioxide gives the plant glucose for food, and gives the world oxygen. Great job today!',
          },
        ],
      },
      keyTerms: {
        create: [
          {
            term: 'Photosynthesis',
            explanation:
              'The way green plants make their own food using sunlight, water, and air. "Photo" means light, and "synthesis" means putting things together.',
            segmentRef: 0,
            ageGroup: 'general',
          },
          {
            term: 'Chlorophyll',
            explanation:
              'The natural green pigment inside leaves that catches sunlight like a tiny solar panel.',
            segmentRef: 2,
            ageGroup: 'general',
          },
          {
            term: 'Chloroplasts',
            explanation:
              'Tiny factory compartments inside plant cells where photosynthesis takes place.',
            segmentRef: 2,
            ageGroup: 'general',
          },
          {
            term: 'Stomata',
            explanation:
              'Microscopic pores (tiny mouths) on the underside of leaves that open and close to breathe in carbon dioxide and let out oxygen.',
            segmentRef: 3,
            ageGroup: 'general',
          },
          {
            term: 'Glucose',
            explanation:
              'A natural simple sugar that plants make for energy and building material to help them grow big and strong.',
            segmentRef: 4,
            ageGroup: 'general',
          },
          {
            term: 'Carbon Dioxide',
            explanation:
              'An invisible gas in the air that humans breathe out, and plants take in to power photosynthesis.',
            segmentRef: 3,
            ageGroup: 'general',
          },
        ],
      },
    },
  })

  // Create Sample Lesson 2: Water Cycle
  const lesson2 = await prisma.video.create({
    data: {
      title: "The Water Cycle: Earth's Natural Recycling System",
      description:
        'Discover how water moves constantly across our planet through evaporation, condensation, precipitation, and collection.',
      summary:
        'The water cycle is Earth’s infinite recycling journey. Sunlight powers evaporation and transpiration to lift vapor into the sky, where it cools into clouds through condensation and falls back to Earth as rain or snow.',
      filename: '/samples/water-cycle.mp4',
      mimetype: 'video/mp4',
      duration: 150.0,
      status: 'READY',
      uploaderId: teacher.id,
      chapters: {
        create: [
          { index: 0, title: 'Earth’s Ancient Water', startTime: 0.0, endTime: 22.0 },
          { index: 1, title: 'Evaporation: Rising to the Sky', startTime: 22.0, endTime: 54.0 },
          { index: 2, title: 'Transpiration: Plants Give Moisture', startTime: 54.0, endTime: 85.0 },
          { index: 3, title: 'Condensation: Making Clouds', startTime: 85.0, endTime: 115.0 },
          { index: 4, title: 'Precipitation: Rain & Snow Return', startTime: 115.0, endTime: 150.0 },
        ],
      },
      practiceQuestions: {
        create: [
          {
            question: 'What turns liquid water into invisible vapor that rises into the sky?',
            answer: 'Evaporation',
            hint: 'The sun provides the warmth for this first step.',
            options: JSON.stringify(['Evaporation', 'Precipitation', 'Freezing', 'Melting']),
            segmentRef: 1,
          },
          {
            question: 'What is the term for water vapor released by plant leaves?',
            answer: 'Transpiration',
            hint: 'Think of it as plants "sweating" water vapor into the air.',
            options: JSON.stringify(['Transpiration', 'Condensation', 'Photosynthesis', 'Respiration']),
            segmentRef: 2,
          },
          {
            question: 'What happens during condensation?',
            answer: 'Water vapor cools down and forms clouds',
            hint: 'Cool air causes tiny droplets to gather together in the sky.',
            options: JSON.stringify([
              'Water vapor cools down and forms clouds',
              'Rain falls to the ground',
              'The sun boils water away',
              'Water seeps into deep soil'
            ]),
            segmentRef: 3,
          },
        ],
      },
      segments: {
        create: [
          {
            startTime: 0.0,
            endTime: 22.0,
            index: 0,
            isCore: false,
            text: 'Hello learners! Did you know the water you drank today might be the same water a dinosaur drank millions of years ago? This is because of the water cycle.',
          },
          {
            startTime: 22.0,
            endTime: 54.0,
            index: 1,
            isCore: true,
            text: 'First is evaporation. The sun warms lakes, rivers, and oceans, turning liquid water into invisible water vapor that floats up into the sky.',
          },
          {
            startTime: 54.0,
            endTime: 85.0,
            index: 2,
            isCore: true,
            text: 'Plants also release water vapor from their leaves in a process called transpiration, adding even more moisture to the air.',
          },
          {
            startTime: 85.0,
            endTime: 115.0,
            index: 3,
            isCore: true,
            text: 'High in the cold sky, condensation happens. The water vapor cools down and clumps together onto tiny dust specks to form fluffy clouds.',
          },
          {
            startTime: 115.0,
            endTime: 150.0,
            index: 4,
            isCore: true,
            text: 'When the clouds become too heavy, precipitation falls down as rain, snow, sleet, or hail, replenishing our rivers and starting the cycle again.',
          },
        ],
      },
      keyTerms: {
        create: [
          {
            term: 'Evaporation',
            explanation:
              'When the sun heats up liquid water and turns it into invisible gas (water vapor) that floats into the sky.',
            segmentRef: 1,
            ageGroup: 'general',
          },
          {
            term: 'Transpiration',
            explanation:
              'Plants "sweating" water vapor out from their leaf pores into the air.',
            segmentRef: 2,
            ageGroup: 'general',
          },
          {
            term: 'Condensation',
            explanation:
              'When cool air causes water vapor gas to turn back into tiny liquid droplets, grouping up to form clouds.',
            segmentRef: 3,
            ageGroup: 'general',
          },
          {
            term: 'Precipitation',
            explanation:
              'Water falling from clouds back to Earth as rain, snow, sleet, or hail.',
            segmentRef: 4,
            ageGroup: 'general',
          },
        ],
      },
    },
  })

  console.log(`Seeded lessons: "${lesson1.title}" and "${lesson2.title}"`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
