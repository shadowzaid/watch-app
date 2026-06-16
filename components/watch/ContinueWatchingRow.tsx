'use client'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { Play, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getImageUrl, getTitle } from '@/lib/tmdb'
import { useProgress } from '@/contexts/ProgressContext'
import type { ProgressItem } from '@/lib/api'
import type { Movie } from '@/lib/tmdb'

interface Props {
  items: ProgressItem[]
  onOpenModal: (movie: Movie) => void
}

export default function ContinueWatchingRow({ items, onOpenModal }: Props) {
  const router   = useRouter()
  const { removeProgress } = useProgress()
  const rowRef   = useRef<HTMLDivElement>(null)
  const [showLeft,  setShowLeft]  = useState(false)
  const [showRight, setShowRight] = useState(true)

  const scroll = (dir: 'left' | 'right') => {
    const el = rowRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -el.clientWidth * 0.75 : el.clientWidth * 0.75, behavior: 'smooth' })
  }

  const onScroll = () => {
    const el = rowRef.current
    if (!el) return
    setShowLeft(el.scrollLeft > 0)
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10)
  }

  if (!items.length) return null

  return (
    <div className="relative group/row px-4 md:px-12 mb-8">
      <h2 className="text-white text-lg md:text-xl font-bold mb-3">Continue Watching</h2>

      {showLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-[calc(100%-2rem)] bg-black/50 px-2 flex items-center opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronLeft size={28} className="text-white" />
        </button>
      )}
      {showRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-[calc(100%-2rem)] bg-black/50 px-2 flex items-center opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <ChevronRight size={28} className="text-white" />
        </button>
      )}

      <div
        ref={rowRef}
        onScroll={onScroll}
        className="flex gap-2 overflow-x-auto scrollbar-none scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        {items.map(item => {
          const movie   = item.movie
          const img     = getImageUrl(movie.backdrop_path || movie.poster_path, 'w780')
          const title   = getTitle(movie)
          const pct     = Math.min(item.percent, 99)
          const mediaType = movie.media_type === 'tv' ? 'tv' : 'movie'

          return (
            <div
              key={item.movie_id}
              className="relative flex-shrink-0 w-[200px] md:w-[260px] cursor-pointer group"
            >
              {/* Thumbnail */}
              <div
                className="relative aspect-video rounded overflow-hidden bg-gray-800"
                onClick={() => router.push(`/watch/${item.movie_id}?type=${mediaType}`)}
              >
                {img ? (
                  <Image
                    src={img}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="260px"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700" />
                )}

                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                    <Play size={20} fill="black" className="ml-1" />
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={e => { e.stopPropagation(); removeProgress(item.movie_id) }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
                >
                  <X size={12} className="text-white" />
                </button>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                  <div className="h-full bg-[#E50914]" style={{ width: `${pct}%` }} />
                </div>
              </div>

              {/* Info */}
              <div className="mt-1 px-0.5">
                <p
                  className="text-white text-xs font-medium truncate hover:underline cursor-pointer"
                  onClick={() => onOpenModal(movie)}
                >
                  {title}
                </p>
                <p className="text-gray-400 text-xs">{pct}% watched</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
