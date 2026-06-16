'use client'
import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Movie } from '@/lib/tmdb'
import MovieCard from './MovieCard'

interface Props {
  title: string
  movies: Movie[]
  onOpenModal: (movie: Movie) => void
}

export default function ContentRow({ title, movies, onOpenModal }: Props) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(true)

  const scroll = (dir: 'left' | 'right') => {
    const el = rowRef.current
    if (!el) return
    const amount = el.clientWidth * 0.75
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  const onScroll = () => {
    const el = rowRef.current
    if (!el) return
    setShowLeft(el.scrollLeft > 0)
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10)
  }

  if (!movies.length) return null

  return (
    <div className="relative group/row px-4 md:px-12 mb-8">
      <h2 className="text-white text-lg md:text-xl font-bold mb-3">{title}</h2>

      {/* Left arrow */}
      {showLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-[calc(100%-2rem)] bg-black/50 px-2 flex items-center opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronLeft size={28} className="text-white" />
        </button>
      )}

      {/* Right arrow */}
      {showRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-[calc(100%-2rem)] bg-black/50 px-2 flex items-center opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronRight size={28} className="text-white" />
        </button>
      )}

      {/* Scrollable row */}
      <div
        ref={rowRef}
        onScroll={onScroll}
        className="flex gap-2 overflow-x-auto scrollbar-none scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} onOpenModal={onOpenModal} />
        ))}
      </div>
    </div>
  )
}
