'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import VideoPlayer from '@/components/watch/VideoPlayer'
import { type MovieDetails, type MediaType, getMovieDetails } from '@/lib/tmdb'

interface Props {
  params: Promise<{ id: string }>
}

export default function WatchPage({ params }: Props) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const mediaType: MediaType = searchParams.get('type') === 'tv' ? 'tv' : 'movie'

  const [details, setDetails] = useState<MovieDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [movieId, setMovieId] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setMovieId(p.id))
  }, [params])

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login')
  }, [user, isLoading, router])

  useEffect(() => {
    if (!movieId || !user) return
    getMovieDetails(Number(movieId), mediaType)
      .then(setDetails)
      .catch(err => { console.error(err); router.back() })
      .finally(() => setLoading(false))
  }, [movieId, mediaType, user, router])

  if (isLoading || loading || !details) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#E50914] text-4xl font-black animate-pulse">WATCH</div>
      </div>
    )
  }

  return <VideoPlayer details={details} />
}
