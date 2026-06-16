'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { Movie } from '@/lib/tmdb'
import { useAuth } from './AuthContext'
import { apiGetProgress, apiSaveProgress, apiDeleteProgress, type ProgressItem } from '@/lib/api'

interface ProgressContextType {
  continueWatching: ProgressItem[]
  saveProgress: (movieId: number, progressSec: number, durationSec: number, movie: Movie) => void
  removeProgress: (movieId: number) => void
  getProgress: (movieId: number) => ProgressItem | null
}

const ProgressContext = createContext<ProgressContextType | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [continueWatching, setContinueWatching] = useState<ProgressItem[]>([])

  useEffect(() => {
    if (!user) { setContinueWatching([]); return }

    apiGetProgress()
      .then(setContinueWatching)
      .catch(() => {
        const stored = localStorage.getItem(`watch_progress_${user.id}`)
        if (stored) setContinueWatching(JSON.parse(stored))
      })
  }, [user])

  useEffect(() => {
    if (user && continueWatching.length > 0) {
      localStorage.setItem(`watch_progress_${user.id}`, JSON.stringify(continueWatching))
    }
  }, [continueWatching, user])

  const saveProgress = useCallback(
    (movieId: number, progressSec: number, durationSec: number, movie: Movie) => {
      const percent = Math.round((progressSec / Math.max(durationSec, 1)) * 100)
      // Don't save if <2% or >95% watched (not meaningful)
      if (percent < 2 || percent > 95) return

      const item: ProgressItem = {
        movie_id: movieId,
        progress_seconds: progressSec,
        duration_seconds: durationSec,
        percent,
        movie,
        updated_at: new Date().toISOString(),
      }

      setContinueWatching(prev => {
        const filtered = prev.filter(p => p.movie_id !== movieId)
        return [item, ...filtered].slice(0, 20)
      })

      apiSaveProgress(movieId, progressSec, durationSec, movie).catch(console.error)
    },
    []
  )

  const removeProgress = useCallback((movieId: number) => {
    setContinueWatching(prev => prev.filter(p => p.movie_id !== movieId))
    apiDeleteProgress(movieId).catch(console.error)
  }, [])

  const getProgress = useCallback(
    (movieId: number) => continueWatching.find(p => p.movie_id === movieId) ?? null,
    [continueWatching]
  )

  return (
    <ProgressContext.Provider value={{ continueWatching, saveProgress, removeProgress, getProgress }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
