'use client'

import React from 'react'
import Link from 'next/link'
import { Sparkles, Video, ShieldCheck, Home } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b-2 border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <span className="font-black text-lg text-gray-900 tracking-tight flex items-center gap-1.5">
              Lecture Companion
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold border border-purple-200">
                AI Review
              </span>
            </span>
            <p className="text-xs text-gray-500 hidden sm:block">
              Accessible Video Review for Elementary & High School Learners
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Main Navigation">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Lessons</span>
          </Link>

          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold bg-gray-900 text-white hover:bg-gray-800 rounded-lg shadow-sm transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Teacher Portal</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}
