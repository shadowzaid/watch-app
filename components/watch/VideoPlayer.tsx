'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, SkipForward, X } from 'lucide-react'
import Image from 'next/image'
import { type MovieDetails, getImageUrl, getTitle, getTrailerKey } from '@/lib/tmdb'
import { useProgress } from '@/contexts/ProgressContext'

interface Props {
  details: MovieDetails
}

const MOVIE_DURATION = 6600  // ~110 min default for movies
const TV_DURATION    = 2700  // ~45 min default for TV episodes

export default function VideoPlayer({ details }: Props) {
  const router = useRouter()
  const { saveProgress, getProgress } = useProgress()

  const trailerKey  = details.videos?.results ? getTrailerKey(details.videos.results) : null
  const backdrop    = getImageUrl(details.backdrop_path, 'original')
  const title       = getTitle(details)
  const isTV        = Boolean(details.number_of_seasons)
  const totalDur    = details.runtime ? details.runtime * 60 : isTV ? TV_DURATION : MOVIE_DURATION

  // Resume from saved progress
  const saved = getProgress(details.id)
  const [elapsed, setElapsed]       = useState(saved?.progress_seconds ?? 0)
  const [playing, setPlaying]       = useState(false)
  const [muted, setMuted]           = useState(false)
  const [showControls, setControls] = useState(true)
  const [started, setStarted]       = useState(false)

  const elapsedRef  = useRef(elapsed)
  const timerRef    = useRef<NodeJS.Timeout | null>(null)
  const saveRef     = useRef<NodeJS.Timeout | null>(null)
  const controlsRef = useRef<NodeJS.Timeout | null>(null)

  // Keep ref in sync
  useEffect(() => { elapsedRef.current = elapsed }, [elapsed])

  // Tick every second while playing
  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setElapsed(s => Math.min(s + 1, totalDur))
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [playing, totalDur])

  // Auto-save progress every 15 seconds
  useEffect(() => {
    saveRef.current = setInterval(() => {
      if (playing) {
        saveProgress(details.id, elapsedRef.current, totalDur, details as any)
      }
    }, 15000)
    return () => { if (saveRef.current) clearInterval(saveRef.current) }
  }, [playing, details, totalDur, saveProgress])

  // Save on unmount / back navigation
  useEffect(() => {
    return () => {
      saveProgress(details.id, elapsedRef.current, totalDur, details as any)
    }
  }, [details, totalDur, saveProgress])

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    setControls(true)
    if (controlsRef.current) clearTimeout(controlsRef.current)
    controlsRef.current = setTimeout(() => setControls(false), 3500)
  }, [])

  const handlePlay = () => {
    if (!started) setStarted(true)
    setPlaying(p => !p)
    resetControlsTimer()
  }

  const percent  = totalDur > 0 ? (elapsed / totalDur) * 100 : 0
  const timeStr  = (s: number) => `${Math.floor(s / 3600) > 0 ? Math.floor(s/3600) + ':' : ''}${String(Math.floor((s % 3600) / 60)).padStart(2,'0')}:${String(Math.floor(s % 60)).padStart(2,'0')}`

  return (
    <div
      className="relative w-full h-screen bg-black overflow-hidden"
      onMouseMove={resetControlsTimer}
      style={{ cursor: showControls ? 'default' : 'none' }}
    >
      {/* Video / trailer */}
      {trailerKey && started ? (
        <iframe
          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&modestbranding=1&rel=0&start=${Math.floor(elapsed)}`}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      ) : (
        <div className="absolute inset-0">
          {backdrop && (
            <Image src={backdrop} alt={title} fill className="object-cover" priority unoptimized />
          )}
          <div className="absolute inset-0 bg-black/50" />
          {!started && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={handlePlay}
                className="w-20 h-20 rounded-full bg-white/20 border-4 border-white flex items-center justify-center hover:bg-white/30 transition-all backdrop-blur-sm"
              >
                <Play size={36} fill="white" className="text-white ml-1" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Controls overlay */}
      <div className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
          <button
            onClick={() => { saveProgress(details.id, elapsedRef.current, totalDur, details as any); router.back() }}
            className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft size={24} />
            <span className="font-semibold">{title}</span>
          </button>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-auto">
          {/* Progress bar */}
          <div
            className="w-full h-1 bg-white/30 rounded-full mb-4 cursor-pointer group"
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect()
              const pct = (e.clientX - rect.left) / rect.width
              setElapsed(Math.floor(pct * totalDur))
            }}
          >
            <div
              className="h-full bg-[#E50914] rounded-full relative"
              style={{ width: `${percent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#E50914] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={handlePlay} className="text-white hover:text-gray-300 transition-colors">
                {playing ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" />}
              </button>
              <button
                onClick={() => setElapsed(s => Math.min(s + 10, totalDur))}
                className="text-white hover:text-gray-300 transition-colors"
                title="Skip 10 seconds"
              >
                <SkipForward size={22} />
              </button>
              <button onClick={() => setMuted(m => !m)} className="text-white hover:text-gray-300 transition-colors">
                {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              <span className="text-white text-sm tabular-nums">
                {timeStr(elapsed)} / {timeStr(totalDur)}
              </span>
              {saved && (
                <span className="text-gray-400 text-xs hidden md:block">
                  Resumed from {timeStr(saved.progress_seconds)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white font-medium text-sm hidden md:block truncate max-w-[200px]">{title}</span>
              <button className="text-white hover:text-gray-300 transition-colors">
                <Maximize size={22} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {!trailerKey && !started && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-4 py-2 rounded">
          No trailer available — showing poster
        </div>
      )}
    </div>
  )
}
