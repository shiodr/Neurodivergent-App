# Neurodivergent-App

AI-Assisted Video Lecture Companion for neurodivergent elementary & high school learners. Web-based tool with video controls, synchronized transcripts/captions, key-term explanations, timestamp navigation, and adjustable settings (speed, text size) to make recorded lessons more accessible and easier to review.

This project is built with [Next.js](https://nextjs.org), bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

> **Important Boundary:** This system is strictly a review and learning support tool. It does not diagnose, grade, evaluate emotion, replace classroom teachers, or handle real-time classes. Learners can use all accommodations without disclosing any diagnosis.

## Key Features

### 1. Accessible Video Player & Chapter Markers
- Custom accessible controls with large touch targets and keyboard navigation (`Space`/`K` play/pause, `←`/`→` 5s seek, `J`/`L` 10s seek, `M` mute).
- Playback speed controls (0.5x, 0.75x, 1x, 1.25x, 1.5x, 1.75x, 2x) to let learners slow down for absorption or speed up for review.
- **Visual Chapter Markers:** Topic notches on the progress bar with hover tooltips and one-click chapter navigation.
- Synchronized caption overlay with high-visibility contrast background.
- Support for MP4 and WebM video formats.

### 2. Conversational AI Lesson Companion
- Clean, non-distracting chat panel strictly grounded in the current lesson transcript + key terms (RAG).
- **Suggested Quick Prompts:** Single-tap chips for "Explain this more simply", "What was the main idea just now?", "I'm confused – help", and "Summarize the last 3 minutes".
- **Age-Level Mode:** One-click toggle between **Elementary** (grades 3-5, everyday analogies, simple language) and **High School** (grades 9-12, conceptual relationships).
- **Audio Text-to-Speech (TTS):** Browser Web Speech API reads any assistant response aloud with one click.
- **Private Persistence:** Chat history automatically saved in `localStorage` per lesson with an instant reset button.
- **Required Safety Disclaimer:** Visible notice that AI is supplementary and non-authoritative.

### 3. Smart Shortening & Core Concepts Mode
- **Core Concepts Only Toggle:** Automatically detects essential segments (tagged with key scientific terms) and skips filler/background details with polite visual transition cues.
- **Pre-Lesson Primer:** Short 2-3 sentence overview card that learners can read or listen to before watching the full lecture.
- **Skip Silence Option:** Automatically detects long pauses or gaps between spoken phrases (> 1.2s) and jumps to the next sentence.

### 4. Interactive Micro-learning Breaks
- Detects natural break intervals (every ~4 minutes or at chapter transitions).
- Displays gentle, non-intrusive pause card:
  - **30-Second Sensory Pause:** Guided box-breathing circle (inhale, hold, exhale) with zero cognitive load.
  - **Simpler Version:** One-click shortcut to have AI re-explain what was just said.
  - **Quick Quiz Check:** Test comprehension before moving on.
- **Auto-Saved Progress:** Automatically saves exact playback timestamp so students can resume anytime without losing their place.

### 5. Focus Mode & Overwhelm Supports
- **Focus Mode:** Dims peripheral panels and spotlights the active video and synchronized transcript sentence.
- **"I'm Stuck / Overwhelmed" Button:** Prominent, calming lavender button that opens an emergency calm sheet with 4 panic-free choices:
  1. Plain-English explanation of recent content
  2. 1-sentence recap of the last 2 minutes
  3. Guided 45-second breathing break
  4. Instant 30-second rewind + slow down to 0.75x
- **Calming Visual Themes:** Warm Sand (low blue-light amber), Sage Calm (relaxing green), Ocean Calm (soft blue), High Contrast (WCAG AA), and Default Slate.
- **Reduced Motion:** Disables animations, pulsing badges, and transitions for vestibular comfort.

### 6. Enhanced AI Utilities & Practice Quiz
- **Multi-Level Explanations:** One-click "Explain like I'm 10", "Give an analogy", and "Explain more deeply".
- **Practice Check Panel:** 3-5 interactive check questions with hints and hidden answers for stress-free self-testing.
- **Selective Floating Toolbar:** Highlight any transcript sentence to instantly Explain, rephrase for age 10, generate an analogy, or listen aloud.

### 7. Teacher / Administrator Portal
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
=== 1. Verifying Database & Extended Models ===
Users: 1, Videos: 2, Transcript Segments: 12, Key Terms: 10, Chapters: 10, Practice Questions: 6

=== 2. Verifying Lesson Retrieval with Chapters & Core Concepts ===
Lesson: "Introduction to Photosynthesis: How Plants Make Food"
Chapters count: 5 | Core Segments: 5 of 7 | Practice Questions seeded: 3

=== 3. Verifying Multi-Mode AI Explanations ===
[Simple Mode] | [Like 10 Mode] | [Analogy Mode] | [Deep Mode]

=== 4. Verifying Conversational RAG AI Companion ===
[Chat Query: "What do chloroplasts do?"] -> Grounded lesson explanation
[Actions: confused, main-idea, summarize-recent] -> Grounded calm helpers

=== 5. Verifying AI Summary & Practice Question Generators ===
Summary & Practice quiz generation verified.

All verification checks passed with 100% success!
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
