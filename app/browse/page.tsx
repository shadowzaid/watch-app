'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useWatchlist } from '@/contexts/WatchlistContext'
import { useProgress } from '@/contexts/ProgressContext'
import Navbar from '@/components/watch/Navbar'
import HeroBanner from '@/components/watch/HeroBanner'
import ContentRow from '@/components/watch/ContentRow'
import ContinueWatchingRow from '@/components/watch/ContinueWatchingRow'
import MovieModal from '@/components/watch/MovieModal'
import Footer from '@/components/watch/Footer'
import {
  type Movie,
  getTrending,
  getPopularMovies,
  getTopRatedMovies,
  getPopularTV,
  getActionMovies,
  getComedyMovies,
  getHorrorMovies,
  getDocumentaries,
  getRecommendations,
  getAnimationMovies,
} from '@/lib/tmdb'

interface RowData { title: string; movies: Movie[] }

export default function BrowsePage() {
  const { user, isLoading } = useAuth()
  const { watchlist } = useWatchlist()
  const { continueWatching } = useProgress()
  const router = useRouter()

  const [rows, setRows]               = useState<RowData[]>([])
  const [featured, setFeatured]       = useState<Movie | null>(null)
  const [recommendations, setRecs]    = useState<Movie[]>([])
  const [selectedMovie, setSelected]  = useState<Movie | null>(null)
  const [fetching, setFetching]       = useState(true)

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login')
  }, [user, isLoading, router])

  // Fetch recommendations based on first watchlist item
  useEffect(() => {
    if (watchlist.length > 0) {
      const first = watchlist[0]
      const type  = first.media_type === 'tv' ? 'tv' : 'movie'
      getRecommendations(first.id, type).then(setRecs).catch(() => {})
    }
  }, [watchlist])

  useEffect(() => {
    if (!user) return

    Promise.all([
      getTrending(),
      getPopularMovies(),
      getTopRatedMovies(),
      getPopularTV(),
      getActionMovies(),
      getComedyMovies(),
      getHorrorMovies(),
      getDocumentaries(),
      getAnimationMovies(),
    ])
      .then(([trending, popular, topRated, tv, action, comedy, horror, docs, animation]) => {
        setFeatured(trending[Math.floor(Math.random() * Math.min(trending.length, 5))] || null)
        setRows([
          { title: 'Trending Now',        movies: trending  },
          { title: 'Popular on Watch',    movies: popular   },
          { title: 'Top Rated',           movies: topRated  },
          { title: 'Popular TV Shows',    movies: tv        },
          { title: 'Action & Adventure',  movies: action    },
          { title: 'Comedies',            movies: comedy    },
          { title: 'Horror Movies',       movies: horror    },
          { title: 'Documentaries',       movies: docs      },
          { title: 'Animation',           movies: animation },
        ])
      })
      .catch(err => { console.error(err) })
      .finally(() => setFetching(false))
  }, [user])

  if (isLoading || !user) return null

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-[#E50914] text-4xl font-black animate-pulse">WATCH</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      {featured && <HeroBanner movie={featured} onOpenModal={setSelected} />}

      <div className="pb-8 -mt-16 relative z-10">
        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <ContinueWatchingRow items={continueWatching} onOpenModal={setSelected} />
        )}

        {/* My List */}
        {watchlist.length > 0 && (
          <ContentRow title="My List" movies={watchlist} onOpenModal={setSelected} />
        )}

        {/* Recommended for You */}
        {recommendations.length > 0 && (
          <ContentRow title="Recommended for You" movies={recommendations} onOpenModal={setSelected} />
        )}

        {rows.map(row => (
          <ContentRow key={row.title} title={row.title} movies={row.movies} onOpenModal={setSelected} />
        ))}
      </div>

      <Footer />

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
