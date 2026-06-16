import type { Movie } from './tmdb'

const API = process.env.NEXT_PUBLIC_API_URL || ''

export interface ApiUser {
  id: string
  name: string
  email: string
  avatar: number
  created_at: string
}

export interface AuthResponse {
  token: string
  user: ApiUser
}

export interface ProgressItem {
  movie_id: number
  progress_seconds: number
  duration_seconds: number
  percent: number
  movie: Movie
  updated_at: string
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('watch_token')
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers as Record<string, string> || {}),
    },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

export const apiRegister = (name: string, email: string, password: string) =>
  apiFetch<AuthResponse>('/api/watch/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })

export const apiLogin = (email: string, password: string) =>
  apiFetch<AuthResponse>('/api/watch/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

export const apiLogout = () =>
  apiFetch<void>('/api/watch/auth/logout', { method: 'POST' }).catch(() => {})

export const apiMe = () => apiFetch<ApiUser>('/api/watch/auth/me')

export const apiGetWatchlist = () => apiFetch<Movie[]>('/api/watch/watchlist')

export const apiAddToWatchlist = (movie: Movie) =>
  apiFetch<void>('/api/watch/watchlist', {
    method: 'POST',
    body: JSON.stringify(movie),
  })

export const apiRemoveFromWatchlist = (movieId: number) =>
  apiFetch<void>(`/api/watch/watchlist/${movieId}`, { method: 'DELETE' })

export const apiGetProgress = () => apiFetch<ProgressItem[]>('/api/watch/progress')

export const apiSaveProgress = (
  movieId: number,
  progressSeconds: number,
  durationSeconds: number,
  movie: Movie
) =>
  apiFetch<void>('/api/watch/progress', {
    method: 'POST',
    body: JSON.stringify({ movie_id: movieId, progress_seconds: progressSeconds, duration_seconds: durationSeconds, movie }),
  })

export const apiDeleteProgress = (movieId: number) =>
  apiFetch<void>(`/api/watch/progress/${movieId}`, { method: 'DELETE' })
