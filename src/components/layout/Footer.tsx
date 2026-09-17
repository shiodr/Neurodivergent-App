import React from 'react'
import { Heart, Shield } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t-2 border-gray-200 bg-white py-8 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>
            <strong>Review Tool Only:</strong> Does not diagnose, grade, or replace teacher instruction. Designed for neurodivergent learners without diagnosis requirement.
          </span>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <span>Built with care for accessible learning</span>
        </div>
      </div>
    </footer>
  )
}
