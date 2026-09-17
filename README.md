# Neurodivergent-App

AI-Assisted Video Lecture Companion for neurodivergent elementary & high school learners. Web-based tool with video controls, synchronized transcripts/captions, key-term explanations, timestamp navigation, and adjustable settings (speed, text size) to make recorded lessons more accessible and easier to review.

This project is built with [Next.js](https://nextjs.org), bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

> **Important Boundary:** This system is strictly a review and learning support tool. It does not diagnose, grade, evaluate emotion, replace classroom teachers, or handle real-time classes. Learners can use all accommodations without disclosing any diagnosis.

## Key Features

### 1. Accessible Video Player
- Custom accessible controls with large touch targets and keyboard navigation (`Space`/`K` play/pause, `←`/`→` 5s seek, `J`/`L` 10s seek, `M` mute).
- Playback speed controls (0.5x, 0.75x, 1x, 1.25x, 1.5x, 1.75x, 2x) to let learners slow down for absorption or speed up for review.
- Synchronized caption overlay with high-visibility contrast background.
- Support for MP4 and WebM video formats.

### 2. Interactive Synchronized Transcript
- Full, searchable lesson transcript organized by timestamped segments.
- Automatically highlights the sentence currently being spoken in the video.
- **Click-to-Seek:** Clicking any sentence in the transcript instantly jumps playback to that exact moment.
- Inline highlighted key terms that open simplified explanations with a single click.
- **On-Demand Explanation:** Highlighting any phrase in the transcript displays a floating *"Explain with AI"* button.

### 3. AI Key Concepts & Simplified Explanations
- Automatically identifies critical academic/scientific concepts from the lesson transcript.
- Generates concise (1–3 sentences), age-appropriate simplified explanations using real-world analogies.
- Directly connects each term to the specific timestamp/segment where the teacher introduced it.
- **Clear AI Safety Disclaimer:** Every AI response is explicitly marked as supplementary and non-authoritative:
  > *"AI Notice: Explanations are supplementary helper notes simplified for learning. They may contain small inaccuracies. Always verify with your teacher or the original lesson."*

### 4. Personalization & WCAG 2.2 AA Accessibility
- **Text Size Adjustment:** Small, Medium, Large, Extra-Large.
- **Video Captions Toggle:** Easily show or hide closed captions on video.
- **High Contrast Mode:** High-contrast color palette, clear borders, and sharp typography.
- **Minimal Distraction UI:** Ample whitespace, calming tones, no sudden pop-ups or autoplay distractions.
- **Persistence:** Learner preferences are automatically saved in `localStorage`.

### 5. Teacher / Administrator Portal
- Upload authorized prerecorded videos (.mp4, .webm).
- Automated background processing pipeline:
  1. Local video storage
  2. Automatic Speech Recognition (ASR) generating timestamped segments
  3. AI key term extraction and simplified concept generation
- Dashboard displaying lesson status (`READY`, `PROCESSING`, `ERROR`), segment counts, and preview links.
- Simple credentials-based authentication for educators.

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) + TypeScript |
| **Styling** | Tailwind CSS + Accessible Radix UI Primitives |
| **Database** | SQLite + Prisma ORM (zero-config local setup) |
| **Authentication** | NextAuth.js (Credentials Provider for Teachers) |
| **Speech Recognition (ASR)** | OpenAI Whisper API (with built-in offline fallback) |
| **AI LLM** | OpenAI GPT-4o-mini (with built-in offline fallback) |
| **Storage** | Local disk storage (`public/uploads/`) |

## Getting Started

### Prerequisites
- Node.js v18+ (tested on Node v20/v26)
- npm or yarn

### 1. Clone and Install Dependencies
```bash
git clone https://github.com/shiodr/Neurodivergent-App.git
cd Neurodivergent-App
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Default `.env` configuration:
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="neurodivergent-app-secret-super-key-32chars-min"

# Optional: Add your OpenAI API key for live Whisper ASR and GPT-4o-mini explanations
# If left empty, built-in intelligent fallback generators allow full offline testing!
OPENAI_API_KEY=""
```

### 3. Initialize Database & Seed Sample Lessons
```bash
# Push schema to SQLite
npx prisma db push

# Seed pre-processed sample lessons
npm run prisma db seed  # or: npx prisma db seed
```

This creates:
- **Teacher Account:** `teacher@school.edu` / `teacher123`
- **Sample Lesson 1:** *Introduction to Photosynthesis: How Plants Make Food* (with video, 7 transcript segments, and 6 key terms)
- **Sample Lesson 2:** *The Water Cycle: Earth's Natural Recycling System* (with video, 5 transcript segments, and 4 key terms)

### 4. Build & Run
```bash
# Development server
npm run dev

# Or production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```text
neurodivergent-app/
├── prisma/
│   ├── schema.prisma         # User, Video, Segment, KeyTerm models
│   └── seed.ts               # Sample educational lessons seed data
├── public/
│   ├── samples/              # Sample educational video files
│   └── uploads/              # Teacher uploaded videos
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout with accessibility providers
│   │   ├── page.tsx          # Learner landing & lesson catalog
│   │   ├── login/page.tsx    # Teacher login page
│   │   ├── admin/
│   │   │   ├── page.tsx      # Teacher dashboard
│   │   │   └── upload/       # Video upload & pipeline page
│   │   ├── lesson/[id]/      # Interactive Learner Player view
│   │   └── api/
│   │       ├── auth/         # NextAuth authentication routes
│   │       ├── videos/       # List, upload, and process videos
│   │       └── explain/      # On-demand AI simplified explanation
│   ├── components/
│   │   ├── video/            # VideoPlayer, VideoControls, CaptionOverlay
│   │   ├── transcript/       # TranscriptPanel, TranscriptSegment
│   │   ├── keyterms/         # KeyTermsPanel
│   │   ├── settings/         # SettingsPanel
│   │   ├── ui/               # Radix UI buttons, sliders, switches, tooltips
│   │   └── layout/           # Header and Footer
│   ├── hooks/
│   │   ├── useVideoPlayer.ts # Playback, seek, speed, and time state
│   │   ├── useTranscript.ts  # Active segment & search filtering
│   │   ├── useKeyTerms.ts    # Key term selection & on-demand requests
│   │   └── useSettings.ts    # Personalization & localStorage persistence
│   ├── lib/
│   │   ├── db.ts             # Prisma client singleton
│   │   ├── auth.ts           # NextAuth credentials configuration
│   │   ├── asr.ts            # Whisper API / fallback transcription
│   │   ├── ai.ts             # GPT-4o-mini / fallback concept extraction
│   │   ├── prompts.ts        # Child-friendly prompt engineering
│   │   └── storage.ts        # File storage utility
│   └── types/
│       └── index.ts          # Shared TypeScript interfaces & types
└── README.md
```

## Accessibility & Inclusive Design (WCAG 2.2 AA)

- **Keyboard Navigable:** All controls, transcript segments, and term chips are focusable and triggerable via keyboard (`Tab`, `Space`, `Enter`, Arrow keys).
- **Reduced Cognitive Fatigue:** Clear information hierarchy, one primary action at a time, soft neutral backgrounds, and explicit disclaimers.
- **Screen Reader Support:** Semantic HTML5 elements (`<video>`, `<button>`, `<section>`, `role="toolbar"`, `role="region"`, `role="status"`), `aria-label`, and `aria-live` regions for captions.
- **Touch Targets:** Buttons and sliders meet or exceed the 44×44px minimum touch target size.
- **Predictable Layout:** Persistent navigation, clear back buttons, and side-by-side synchronized panels.

## Verification & Testing

Run the automated verification suite to validate database queries, model relationships, ASR pipelines, and AI services:

```bash
npx tsx scripts/test-companion.ts
```

Output:
```text
=== Verifying Database & Models ===
Users: 1
Videos: 2
Transcript Segments: 12
Key Terms: 10
=== Verifying Lesson Retrieval ===
Lesson: "Introduction to Photosynthesis: How Plants Make Food"
=== Verifying AI Explanation Service ===
All verification checks passed!
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Project Notes

This app is designed to support learners who benefit from clearer pacing, captions, explanations, and adjustable viewing options while reviewing recorded lessons.

## License
MIT
