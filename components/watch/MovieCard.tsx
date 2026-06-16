'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Play, Plus, Check, ThumbsUp, ChevronDown } from 'lucide-react'
import { type Movie, getImageUrl, getTitle, getYear } from '@/lib/tmdb'
import { useWatchlist } from '@/contexts/WatchlistContext'

function placeholder(text: string) {
  return `https://placehold.co/780x440/1a1a1a/e50914?text=${encodeURIComponent(text)}&font=montserrat`
}

const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller',
  10752: 'War', 37: 'Western', 10759: 'Action', 10765: 'Sci-Fi',
  10762: 'Kids', 10763: 'News', 10764: 'Reality', 10766: 'Soap',
  10767: 'Talk', 10768: 'War',
}

interface Props {
  movie: Movie
  onOpenModal: (movie: Movie) => void
}

export default function MovieCard({ movie, onOpenModal }: Props) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
  const [hovered, setHovered] = useState(false)
  const inList = isInWatchlist(movie.id)

  const backdrop = getImageUrl(movie.backdrop_path || movie.poster_path, 'w780')
  const poster = getImageUrl(movie.poster_path, 'w500')
  const title = getTitle(movie)
  const year = getYear(movie)
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '—'
  const genres = (movie.genre_ids || []).slice(0, 3).map(id => GENRE_MAP[id]).filter(Boolean)

  const fallbackSrc = placeholder(title)
  const [thumbSrc, setThumbSrc] = useState(backdrop || poster || fallbackSrc)
  const [hoverSrc, setHoverSrc] = useState(backdrop || poster || fallbackSrc)

  const handleThumbError = () => {
    if (thumbSrc !== poster && poster) setThumbSrc(poster)
    else setThumbSrc(fallbackSrc)
  }
  const handleHoverError = () => {
    if (hoverSrc !== poster && poster) setHoverSrc(poster)
    else setHoverSrc(fallbackSrc)
  }

  return (
    <div
      className="relative flex-shrink-0 w-[160px] md:w-[220px] cursor-pointer group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video rounded overflow-hidden bg-gray-800">
        <Image
          src={thumbSrc}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 160px, 220px"
          unoptimized
          onError={handleThumbError}
        />
      </div>

      {/* Hover card */}
      {hovered && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-40 w-[260px] md:w-[300px] bg-[#181818] rounded-md shadow-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200">
          {/* Backdrop */}
          <div className="relative aspect-video bg-gray-800">
            <Image
              src={hoverSrc}
              alt={title}
              fill
              className="object-cover"
              sizes="300px"
              unoptimized
              onError={handleHoverError}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />
          </div>

          {/* Info */}
          <div className="px-4 py-3 space-y-3">
            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open(`/watch/${movie.id}${movie.media_type === 'tv' ? '?type=tv' : ''}`, '_self')}
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Play size={16} fill="black" className="text-black ml-0.5" />
              </button>
              <button
                onClick={() => inList ? removeFromWatchlist(movie.id) : addToWatchlist(movie)}
                className="w-9 h-9 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white transition-colors"
                title={inList ? 'Remove from My List' : 'Add to My List'}
              >
                {inList ? (
                  <Check size={16} className="text-white" />
                ) : (
                  <Plus size={16} className="text-white" />
                )}
              </button>
              <button className="w-9 h-9 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white transition-colors">
                <ThumbsUp size={16} className="text-white" />
              </button>
              <button
                onClick={() => onOpenModal(movie)}
                className="w-9 h-9 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white transition-colors ml-auto"
                title="More info"
              >
                <ChevronDown size={16} className="text-white" />
              </button>
            </div>

            {/* Meta */}
            <div>
              <p className="text-white font-semibold text-sm leading-tight">{title}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-green-400 text-xs font-bold">{rating} ★</span>
                {year && <span className="text-gray-400 text-xs">{year}</span>}
                <span className="text-gray-400 text-xs border border-gray-500 px-1 text-[10px]">
                  {movie.adult ? '18+' : 'PG'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {genres.map(g => (
                  <span key={g} className="text-gray-300 text-[10px]">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
