'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, Play, Plus, Check, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  type Movie,
  type MovieDetails,
  getImageUrl,
  getTitle,
  getYear,
  getTrailerKey,
  getMovieDetails,
} from '@/lib/tmdb'
import { useWatchlist } from '@/contexts/WatchlistContext'

interface Props {
  movie: Movie
  onClose: () => void
}

export default function MovieModal({ movie, onClose }: Props) {
  const router = useRouter()
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
  const [details, setDetails] = useState<MovieDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const inList = isInWatchlist(movie.id)

  const mediaType = movie.media_type || 'movie'

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    setLoading(true)
    getMovieDetails(movie.id, mediaType)
      .then(setDetails)
      .catch(console.error)
      .finally(() => setLoading(false))
    return () => { document.body.style.overflow = '' }
  }, [movie.id, mediaType])

  const title = getTitle(movie)
  const year = getYear(movie)
  const backdrop = getImageUrl(movie.backdrop_path, 'original')
  const trailerKey = details?.videos?.results ? getTrailerKey(details.videos.results) : null
  const cast = details?.credits?.cast?.slice(0, 8) || []
  const similar = details?.similar?.results?.slice(0, 12) || []
  const genres = details?.genres || []

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 overflow-y-auto py-8 px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-3xl bg-[#181818] rounded-lg overflow-hidden shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[#181818] flex items-center justify-center hover:bg-[#2a2a2a] transition-colors"
        >
          <X size={18} className="text-white" />
        </button>

        {/* Hero */}
        <div className="relative aspect-video bg-gray-900">
          {trailerKey ? (
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}`}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : backdrop ? (
            <Image
              src={backdrop}
              alt={title}
              fill
              className="object-cover"
              sizes="768px"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gray-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />

          {/* Action buttons over hero */}
          <div className="absolute bottom-6 left-6 flex items-center gap-3">
            <button
              onClick={() => router.push(`/watch/${movie.id}${mediaType === 'tv' ? '?type=tv' : ''}`)}
              className="flex items-center gap-2 bg-white text-black font-bold px-5 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
              <Play size={18} fill="black" />
              Play
            </button>
            <button
              onClick={() => inList ? removeFromWatchlist(movie.id) : addToWatchlist(movie)}
              className="w-9 h-9 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white transition-colors"
            >
              {inList ? <Check size={16} className="text-white" /> : <Plus size={16} className="text-white" />}
            </button>
            <button className="w-9 h-9 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white transition-colors">
              <ThumbsUp size={16} className="text-white" />
            </button>
            <button className="w-9 h-9 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white transition-colors">
              <ThumbsDown size={16} className="text-white" />
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="p-6">
          {loading ? (
            <div className="space-y-3">
              <div className="h-6 bg-gray-700 rounded w-1/2 animate-pulse" />
              <div className="h-4 bg-gray-700 rounded animate-pulse" />
              <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse" />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Left: main info */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-green-400 font-bold text-sm">
                    {movie.vote_average?.toFixed(1)} ★ Match
                  </span>
                  {year && <span className="text-gray-300 text-sm">{year}</span>}
                  {details?.runtime && (
                    <span className="text-gray-300 text-sm">
                      {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                    </span>
                  )}
                  {details?.number_of_seasons && (
                    <span className="text-gray-300 text-sm">
                      {details.number_of_seasons} Season{details.number_of_seasons > 1 ? 's' : ''}
                    </span>
                  )}
                  <span className="border border-gray-500 text-gray-400 text-xs px-1">
                    {movie.adult ? '18+' : 'PG'}
                  </span>
                  {mediaType === 'tv' && (
                    <span className="border border-gray-500 text-gray-400 text-xs px-1">HD</span>
                  )}
                </div>

                {details?.tagline && (
                  <p className="text-gray-400 italic text-sm">"{details.tagline}"</p>
                )}
                <p className="text-gray-300 text-sm leading-relaxed">{movie.overview}</p>
              </div>

              {/* Right: meta */}
              <div className="space-y-2 text-sm">
                {cast.length > 0 && (
                  <p className="text-gray-500">
                    <span className="text-gray-400">Cast: </span>
                    {cast.map(c => c.name).join(', ')}
                  </p>
                )}
                {genres.length > 0 && (
                  <p className="text-gray-500">
                    <span className="text-gray-400">Genres: </span>
                    {genres.map(g => g.name).join(', ')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Similar */}
          {similar.length > 0 && (
            <div className="mt-8">
              <h3 className="text-white text-lg font-bold mb-4">More Like This</h3>
              <div className="grid grid-cols-3 gap-3">
                {similar.slice(0, 9).map(m => {
                  const img = getImageUrl(m.backdrop_path || m.poster_path, 'w500')
                  return (
                    <div
                      key={m.id}
                      className="relative bg-gray-800 rounded overflow-hidden cursor-pointer group"
                      onClick={() => onClose()}
                    >
                      <div className="aspect-video relative">
                        {img ? (
                          <Image
                            src={img}
                            alt={getTitle(m)}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                            sizes="200px"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700" />
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-white text-xs font-medium truncate">{getTitle(m)}</p>
                        <p className="text-green-400 text-xs">{m.vote_average?.toFixed(1)} ★</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
