import React from 'react'
import { notFound } from 'next/navigation'
import prisma from '@/lib/db'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { LessonClient } from './LessonClient'

interface LessonPageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function LessonPage({ params }: LessonPageProps) {
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
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
        <LessonClient video={video} />
      </main>
      <Footer />
    </div>
  )
}
