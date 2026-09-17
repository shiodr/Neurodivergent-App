import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'

export const metadata: Metadata = {
  title: 'Lecture Companion — AI-Assisted Video Review for Neurodivergent Learners',
  description:
    'Accessible video lecture review tool for elementary and high school learners with synchronized transcripts, timestamp navigation, and simplified AI key-term explanations.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-gray-900 font-sans selection:bg-blue-200">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
