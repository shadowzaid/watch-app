const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || ''
const BASE_URL = 'https://api.themoviedb.org/3'
export const IMAGE_BASE = 'https://image.tmdb.org/t/p'

function isDemoMode() {
  return !API_KEY || API_KEY === 'your_tmdb_api_key_here'
}

export type MediaType = 'movie' | 'tv'

export interface Movie {
  id: number
  title?: string
  name?: string
  original_title?: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  vote_count: number
  release_date?: string
  first_air_date?: string
  genre_ids?: number[]
  genres?: Genre[]
  media_type?: MediaType
  popularity: number
  adult?: boolean
  runtime?: number
  number_of_seasons?: number
  number_of_episodes?: number
  tagline?: string
  status?: string
}

export interface Genre {
  id: number
  name: string
}

export interface Video {
  id: string
  key: string
  name: string
  site: string
  type: string
  official: boolean
}

export interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
}

export interface MovieDetails extends Movie {
  genres: Genre[]
  credits?: { cast: CastMember[] }
  similar?: { results: Movie[] }
  videos?: { results: Video[] }
}

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`)
  url.searchParams.set('api_key', API_KEY)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`TMDB fetch failed: ${res.status}`)
  return res.json()
}

export function getImageUrl(
  path: string | null,
  size: 'w300' | 'w500' | 'w780' | 'original' = 'w500'
) {
  if (!path) return null
  return `${IMAGE_BASE}/${size}${path}`
}

export function getTitle(item: Movie): string {
  return item.title || item.name || 'Unknown'
}

export function getYear(item: Movie): string {
  const date = item.release_date || item.first_air_date
  return date ? String(new Date(date).getFullYear()) : ''
}

export function getTrailerKey(videos: Video[]): string | null {
  const trailer =
    videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official) ||
    videos.find(v => v.type === 'Trailer' && v.site === 'YouTube') ||
    videos.find(v => v.site === 'YouTube')
  return trailer?.key || null
}

import {
  MOCK_TRENDING, MOCK_POPULAR, MOCK_TOP_RATED, MOCK_TV,
  MOCK_ACTION, MOCK_COMEDY, MOCK_HORROR, MOCK_DOCS, MOCK_ANIMATION,
  mockSearch, mockGetDetails,
} from './mock-data'

export async function getTrending(): Promise<Movie[]> {
  if (isDemoMode()) return MOCK_TRENDING
  const data = await tmdbFetch<{ results: Movie[] }>('/trending/all/week')
  return data.results.slice(0, 20)
}

export async function getPopularMovies(): Promise<Movie[]> {
  if (isDemoMode()) return MOCK_POPULAR
  const data = await tmdbFetch<{ results: Movie[] }>('/movie/popular')
  return data.results
}

export async function getTopRatedMovies(): Promise<Movie[]> {
  if (isDemoMode()) return MOCK_TOP_RATED
  const data = await tmdbFetch<{ results: Movie[] }>('/movie/top_rated')
  return data.results
}

export async function getPopularTV(): Promise<Movie[]> {
  if (isDemoMode()) return MOCK_TV
  const data = await tmdbFetch<{ results: Movie[] }>('/tv/popular')
  return data.results.map(item => ({ ...item, media_type: 'tv' as MediaType }))
}

export async function getActionMovies(): Promise<Movie[]> {
  if (isDemoMode()) return MOCK_ACTION
  const data = await tmdbFetch<{ results: Movie[] }>('/discover/movie', { with_genres: '28' })
  return data.results
}

export async function getComedyMovies(): Promise<Movie[]> {
  if (isDemoMode()) return MOCK_COMEDY
  const data = await tmdbFetch<{ results: Movie[] }>('/discover/movie', { with_genres: '35' })
  return data.results
}

export async function getHorrorMovies(): Promise<Movie[]> {
  if (isDemoMode()) return MOCK_HORROR
  const data = await tmdbFetch<{ results: Movie[] }>('/discover/movie', { with_genres: '27' })
  return data.results
}

export async function getDocumentaries(): Promise<Movie[]> {
  if (isDemoMode()) return MOCK_DOCS
  const data = await tmdbFetch<{ results: Movie[] }>('/discover/movie', { with_genres: '99' })
  return data.results
}

export async function getMovieDetails(id: number, type: MediaType = 'movie'): Promise<MovieDetails> {
  if (isDemoMode()) return mockGetDetails(id)
  return tmdbFetch<MovieDetails>(`/${type}/${id}`, {
    append_to_response: 'videos,credits,similar',
  })
}

export async function searchMulti(query: string): Promise<Movie[]> {
  if (!query.trim()) return []
  if (isDemoMode()) return mockSearch(query)
  const data = await tmdbFetch<{ results: Movie[] }>('/search/multi', { query })
  return data.results.filter(
    item => item.media_type === 'movie' || item.media_type === 'tv'
  )
}

export async function getRecommendations(id: number, type: MediaType = 'movie'): Promise<Movie[]> {
  if (isDemoMode()) return MOCK_TRENDING.slice(0, 12)
  const data = await tmdbFetch<{ results: Movie[] }>(`/${type}/${id}/recommendations`)
  return data.results.slice(0, 20)
}

export async function getAnimationMovies(): Promise<Movie[]> {
  if (isDemoMode()) return MOCK_ANIMATION
  const data = await tmdbFetch<{ results: Movie[] }>('/discover/movie', { with_genres: '16' })
  return data.results
}

export async function getRomanceMovies(): Promise<Movie[]> {
  if (isDemoMode()) return MOCK_COMEDY
  const data = await tmdbFetch<{ results: Movie[] }>('/discover/movie', { with_genres: '10749' })
  return data.results
}
