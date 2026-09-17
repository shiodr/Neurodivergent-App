import React from 'react'
import Link from 'next/link'
import prisma from '@/lib/db'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import {
  Upload,
  Video,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Plus,
} from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const videos = await prisma.video.findMany({
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-md">
                Teacher & Administrator Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              Prerecorded Lesson Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Upload authorized recorded lessons to automatically generate transcripts and AI key-term explanations.
            </p>
          </div>

          <Link
            href="/admin/upload"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors focus:outline-none focus:ring-3 focus:ring-blue-400 self-start sm:self-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Upload New Lesson Video</span>
          </Link>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{videos.length}</p>
              <p className="text-xs font-semibold text-gray-500">Total Lessons</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-700">
                {videos.filter((v) => v.status === 'READY').length}
              </p>
              <p className="text-xs font-semibold text-gray-500">Ready for Review</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-purple-700">
                {videos.reduce((acc, v) => acc + (v._count?.keyTerms || 0), 0)}
              </p>
              <p className="text-xs font-semibold text-gray-500">Total Key Terms Defined</p>
            </div>
          </div>
        </div>

        {/* Video Table List */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Recorded Lessons</h2>
            <span className="text-xs text-gray-500 font-medium">
              Only authorized lessons appear to learners
            </span>
          </div>

          {videos.length === 0 ? (
            <div className="p-12 text-center">
              <Upload className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-bold text-gray-700">No lessons uploaded yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Upload your first lesson to trigger speech recognition and concept extraction.
              </p>
              <Link
                href="/admin/upload"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors"
              >
                Upload Video
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500 border-b">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">
                      Lesson Title
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Duration
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Segments
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Key Terms
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {videos.map((video) => (
                    <tr key={video.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">
                        <div>
                          <span>{video.title}</span>
                          {video.description && (
                            <p className="text-xs font-normal text-gray-500 line-clamp-1 mt-0.5">
                              {video.description}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {video.status === 'READY' && (
                          <Badge variant="secondary" className="gap-1 font-bold">
                            <CheckCircle className="w-3 h-3" />
                            Ready
                          </Badge>
                        )}
                        {video.status === 'PROCESSING' && (
                          <Badge variant="warning" className="gap-1 font-bold animate-pulse">
                            <Clock className="w-3 h-3" />
                            Processing ASR
                          </Badge>
                        )}
                        {video.status === 'ERROR' && (
                          <Badge variant="outline" className="gap-1 font-bold text-red-700 border-red-300">
                            <AlertCircle className="w-3 h-3" />
                            Error
                          </Badge>
                        )}
                      </td>

                      <td className="px-6 py-4 font-mono text-xs">
                        {video.duration ? formatDuration(video.duration) : '--:--'}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-700">
                          {video._count.segments} lines
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {video._count.keyTerms} terms
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/lesson/${video.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          <span>Preview Player</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
