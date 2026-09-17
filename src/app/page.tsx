import React from 'react'
import Link from 'next/link'
import prisma from '@/lib/db'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PlayCircle, Clock, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const videos = await prisma.video.findMany({
    where: { status: 'READY' },
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Welcome Banner */}
        <section className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold tracking-wide uppercase mb-4 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Calm & Accessible Study Space
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Review Recorded Lessons at Your Own Pace
            </h1>
            <p className="mt-3 text-sm sm:text-lg text-blue-100 leading-relaxed font-medium">
              Watch classroom lessons with interactive text, jump anywhere with one click, and explore easy-to-understand definitions for tricky words.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-xs sm:text-sm font-semibold text-blue-100">
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>No diagnosis or signup needed</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Clickable spoken transcript</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Simplified AI term explanations</span>
              </div>
            </div>
          </div>
        </section>

        {/* Lessons Grid Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Authorized Classroom Lessons
            </h2>
            <p className="text-sm text-gray-600 mt-0.5">
              Select a lesson below to begin reviewing.
            </p>
          </div>
          <span className="text-xs font-bold text-gray-700 bg-gray-200/80 px-3 py-1 rounded-full">
            {videos.length} available
          </span>
        </div>

        {/* Video Cards Grid */}
        {videos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-300 p-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">No lessons available yet</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              Ask your teacher or admin to upload lesson videos to start reviewing.
            </p>
            <Link
              href="/admin"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm"
            >
              Go to Teacher Upload Portal
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col group"
              >
                {/* Visual Header Banner */}
                <div className="bg-gradient-to-br from-blue-900 to-indigo-900 p-6 flex items-center justify-center relative aspect-[16/9] group-hover:from-blue-800 group-hover:to-indigo-800 transition-colors">
                  <PlayCircle className="w-16 h-16 text-white/90 group-hover:scale-110 transition-transform drop-shadow-md" />
                  {video.duration && (
                    <span className="absolute bottom-3 right-3 bg-black/80 text-white text-xs font-mono font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDuration(video.duration)}
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                        {video.description}
                      </p>
                    )}
                  </div>

                  {/* Metadata & Launch Button */}
                  <div className="pt-5 mt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                      <span className="bg-blue-50 text-blue-800 px-2 py-1 rounded-md border border-blue-200">
                        {video._count.segments} lines
                      </span>
                      <span className="bg-purple-50 text-purple-800 px-2 py-1 rounded-md border border-purple-200">
                        {video._count.keyTerms} key terms
                      </span>
                    </div>

                    <Link
                      href={`/lesson/${video.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 focus:outline-none focus:ring-3 focus:ring-blue-400 transition-colors shadow-sm"
                      aria-label={`Open lesson: ${video.title}`}
                    >
                      <span>Open Lesson</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
