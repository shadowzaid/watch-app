'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Play, Info, VolumeX, Volume2 } from 'lucide-react'
import { type Movie, getImageUrl, getTitle } from '@/lib/tmdb'
import { useRouter } from 'next/navigation'

interface Props {
  movie: Movie
  onOpenModal: (movie: Movie) => void
}

export default function HeroBanner({ movie, onOpenModal }: Props) {
  const router = useRouter()
  const [muted, setMuted] = useState(true)

  const backdrop = getImageUrl(movie.backdrop_path, 'original')
  const title = getTitle(movie)
  const overview = movie.overview
    ? movie.overview.length > 180
      ? movie.overview.slice(0, 180) + '…'
      : movie.overview
    : ''

  return (
    <div className="relative w-full h-[56vw] min-h-[400px] max-h-[85vh] overflow-hidden">
      {/* Background image */}
      {backdrop ? (
        <Image
          src={backdrop}
          alt={title}
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-gray-900" />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute bottom-[20%] left-4 md:left-12 max-w-lg z-10">
        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight drop-shadow-lg">
          {title}
        </h1>

        {/* Overview */}
        <p className="text-sm md:text-base text-gray-200 mb-5 leading-relaxed hidden md:block">
          {overview}
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/watch/${movie.id}${movie.media_type === 'tv' ? '?type=tv' : ''}`)}
            className="flex items-center gap-2 bg-white text-black font-bold px-6 py-2.5 rounded-md hover:bg-gray-200 transition-colors text-sm md:text-base"
          >
            <Play size={20} fill="black" />
            Play
          </button>
          <button
            onClick={() => onOpenModal(movie)}
            className="flex items-center gap-2 bg-white/20 text-white font-semibold px-6 py-2.5 rounded-md hover:bg-white/30 transition-colors backdrop-blur-sm text-sm md:text-base"
          >
            <Info size={20} />
            More Info
          </button>
        </div>
      </div>

      {/* Volume control */}
      <div className="absolute bottom-[20%] right-4 md:right-12 z-10 flex items-center gap-3">
        <button
          onClick={() => setMuted(m => !m)}
          className="w-9 h-9 rounded-full border-2 border-white/60 flex items-center justify-center hover:border-white transition-colors"
        >
          {muted ? (
            <VolumeX size={16} className="text-white" />
          ) : (
            <Volume2 size={16} className="text-white" />
          )}
        </button>
        <span className="bg-[#333]/80 text-white text-xs px-3 py-1 font-semibold">
          {movie.adult ? '18+' : 'PG'}
        </span>
      </div>
    </div>
  )
}
