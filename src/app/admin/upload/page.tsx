'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Upload,
  ArrowLeft,
  FileVideo,
  Sparkles,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'

export default function UploadPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [currentStep, setCurrentStep] = useState<
    'idle' | 'uploading' | 'transcribing' | 'extracting' | 'completed' | 'error'
  >('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [createdVideoId, setCreatedVideoId] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      setFile(selected)
      if (!title) {
        // Auto-generate title from filename
        const clean = selected.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
        setTitle(clean.charAt(0).toUpperCase() + clean.slice(1))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title) {
      setErrorMessage('Please provide both a video file and lesson title.')
      return
    }

    setIsUploading(true)
    setErrorMessage(null)
    setCurrentStep('uploading')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('description', description)

      // Step simulation for learner/teacher clarity
      const stepTimer = setTimeout(() => {
        setCurrentStep('transcribing')
      }, 1500)

      const stepTimer2 = setTimeout(() => {
        setCurrentStep('extracting')
      }, 4000)

      const response = await fetch('/api/videos', {
        method: 'POST',
        body: formData,
      })

      clearTimeout(stepTimer)
      clearTimeout(stepTimer2)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to upload and process video.')
      }

      const data = await response.json()
      setCreatedVideoId(data.id)
      setCurrentStep('completed')
    } catch (err) {
      console.error(err)
      setCurrentStep('error')
      setErrorMessage(
        err instanceof Error ? err.message : 'Upload failed. Please check network connection.'
      )
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header link */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Teacher Dashboard</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-md p-6 sm:p-10">
          <div className="border-b pb-6 mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Upload Lesson Video
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Add an authorized video lesson. The pipeline will automatically transcribe spoken sentences and extract simplified key-term explanations.
            </p>
          </div>

          {/* Processing Progress Status Display */}
          {currentStep !== 'idle' && currentStep !== 'error' && (
            <div className="mb-8 p-6 rounded-2xl bg-blue-50 border-2 border-blue-200 space-y-4">
              <h2 className="text-base font-bold text-blue-950 flex items-center gap-2">
                {currentStep === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                )}
                <span>Processing Pipeline</span>
              </h2>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-blue-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>1. Video uploaded and stored locally</span>
                </div>

                <div
                  className={`flex items-center gap-2 ${
                    currentStep === 'transcribing'
                      ? 'text-blue-700 font-bold animate-pulse'
                      : currentStep === 'extracting' || currentStep === 'completed'
                      ? 'text-blue-900'
                      : 'text-gray-400'
                  }`}
                >
                  {currentStep === 'transcribing' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  ) : currentStep === 'extracting' || currentStep === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                  <span>2. Automatic Speech Recognition (ASR) generating timestamps</span>
                </div>

                <div
                  className={`flex items-center gap-2 ${
                    currentStep === 'extracting'
                      ? 'text-purple-700 font-bold animate-pulse'
                      : currentStep === 'completed'
                      ? 'text-blue-900'
                      : 'text-gray-400'
                  }`}
                >
                  {currentStep === 'extracting' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  ) : currentStep === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>3. AI extracting key terms & age-appropriate explanations</span>
                </div>
              </div>

              {currentStep === 'completed' && (
                <div className="pt-4 border-t border-blue-200 flex flex-wrap gap-3">
                  <Button
                    onClick={() => router.push(`/lesson/${createdVideoId}`)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    Open Lesson in Learner Player
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/admin')}
                    className="font-bold"
                  >
                    Return to Teacher Dashboard
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border-2 border-red-200 text-red-900 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Upload Error</p>
                <p className="text-xs mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Upload Form */}
          {currentStep !== 'completed' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Dropzone / Selector */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Video File (.mp4 or .webm)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-blue-50/30 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <FileVideo className="w-12 h-12 text-blue-600" />
                      <p className="font-bold text-sm text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB &bull; Click to change
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-12 h-12 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      <p className="font-bold text-sm text-gray-800">
                        Click to browse video file
                      </p>
                      <p className="text-xs text-gray-500">
                        Supports MP4 and WebM formats up to 500MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-bold text-gray-800 mb-1.5">
                  Lesson Title *
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Understanding Fractions with Shapes"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-3 focus:ring-blue-400 text-sm font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-bold text-gray-800 mb-1.5">
                  Lesson Description & Learning Objectives
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe what learners will review in this lesson..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-3 focus:ring-blue-400 text-sm font-medium"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t">
                <Button
                  type="submit"
                  disabled={isUploading || !file || !title}
                  className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-50"
                >
                  {isUploading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading & Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Upload and Process Video
                    </span>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
