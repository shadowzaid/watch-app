'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Movie } from '@/lib/tmdb'
import { useAuth } from './AuthContext'
import {
  apiGetWatchlist,
  apiAddToWatchlist,
  apiRemoveFromWatchlist,
} from '@/lib/api'

interface WatchlistContextType {
  watchlist: Movie[]
  addToWatchlist: (movie: Movie) => void
  removeFromWatchlist: (id: number) => void
  isInWatchlist: (id: number) => boolean
}

const WatchlistContext = createContext<WatchlistContextType | null>(null)

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [watchlist, setWatchlist] = useState<Movie[]>([])

  useEffect(() => {
    if (!user) { setWatchlist([]); return }

    apiGetWatchlist()
      .then(setWatchlist)
      .catch(() => {
        // Fall back to localStorage if backend unreachable
        const stored = localStorage.getItem(`watch_watchlist_${user.id}`)
        if (stored) setWatchlist(JSON.parse(stored))
      })
  }, [user])

  // Keep localStorage in sync as a local cache
  useEffect(() => {
    if (user) {
      localStorage.setItem(`watch_watchlist_${user.id}`, JSON.stringify(watchlist))
    }
  }, [watchlist, user])

  const addToWatchlist = (movie: Movie) => {
    if (watchlist.some(m => m.id === movie.id)) return
    const updated = [movie, ...watchlist]
    setWatchlist(updated)
    apiAddToWatchlist(movie).catch(console.error)
  }

  const removeFromWatchlist = (id: number) => {
    setWatchlist(prev => prev.filter(m => m.id !== id))
    apiRemoveFromWatchlist(id).catch(console.error)
  }

  const isInWatchlist = (id: number) => watchlist.some(m => m.id === id)

  return (
    <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  )
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext)
  if (!ctx) throw new Error('useWatchlist must be used within WatchlistProvider')
  return ctx
}
