'use client'

import React from 'react'

interface CaptionOverlayProps {
  text: string
}

export function CaptionOverlay({ text }: CaptionOverlayProps) {
  return (
    <div
      className="absolute bottom-16 left-0 right-0 flex justify-center px-4 pointer-events-none"
      role="status"
      aria-live="polite"
      aria-label="Caption"
    >
      <div className="bg-black/80 text-white px-4 py-2 rounded-lg max-w-[80%] text-center">
        <p className="text-sm sm:text-base leading-relaxed">{text}</p>
      </div>
    </div>
  )
}
