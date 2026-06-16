'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Search } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useWatchlist } from '@/contexts/WatchlistContext'
import Navbar from '@/components/watch/Navbar'
import MovieModal from '@/components/watch/MovieModal'
import ContentRow from '@/components/watch/ContentRow'
import { type Movie, getImageUrl, getTitle, getYear, searchMulti } from '@/lib/tmdb'

function SearchResults() {
  const { user, isLoading } = useAuth()
  const { watchlist } = useWatchlist()
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const isList = searchParams.get('list') === 'watchlist'

  const [results, setResults] = useState<Movie[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login')
  }, [user, isLoading, router])

  useEffect(() => {
    if (!query.trim() || isList) {
      setResults([])
      return
    }
    setSearching(true)
    searchMulti(query)
      .then(setResults)
      .catch(console.error)
      .finally(() => setSearching(false))
  }, [query, isList])

  if (isLoading || !user) return null

  const displayMovies = isList ? watchlist : results
  const pageTitle = isList ? 'My List' : query ? `Results for "${query}"` : 'Search'

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Navbar />
      <div className="pt-24 px-4 md:px-12 pb-12">
        <h1 className="text-2xl font-bold mb-8">{pageTitle}</h1>

        {searching && (
          <div className="flex items-center justify-center py-20">
            <div className="text-[#E50914] text-2xl font-black animate-pulse">Searching…</div>
          </div>
        )}

        {!searching && !isList && !query && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search size={64} className="text-gray-600 mb-4" />
            <p className="text-gray-500 text-lg">Search for movies and TV shows</p>
          </div>
        )}

        {!searching && displayMovies.length === 0 && (query || isList) && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-400 text-xl">No titles found</p>
            {isList && (
              <p className="text-gray-500 mt-2 text-sm">
                Add movies from browse to see them here.
              </p>
            )}
          </div>
        )}

        {!searching && displayMovies.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {displayMovies.map(movie => {
              const img = getImageUrl(movie.poster_path || movie.backdrop_path, 'w500')
              return (
                <div
                  key={movie.id}
                  className="relative cursor-pointer group"
                  onClick={() => setSelectedMovie(movie)}
                >
                  <div className="relative aspect-[2/3] bg-gray-800 rounded overflow-hidden">
                    {img ? (
                      <Image
                        src={img}
                        alt={getTitle(movie)}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center p-2">
                        <span className="text-gray-500 text-xs text-center">{getTitle(movie)}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  </div>
                  <div className="mt-2 px-1">
                    <p className="text-white text-xs font-medium truncate">{getTitle(movie)}</p>
                    <p className="text-gray-400 text-xs">{getYear(movie)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  )
}
